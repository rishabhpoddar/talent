import { Inject, Injectable } from '@nestjs/common';
import supertokens, { User, RecipeUserId } from "supertokens-node";
import Session from 'supertokens-node/recipe/session';
import ThirdPartyEmailPassword from 'supertokens-node/recipe/thirdpartyemailpassword';
import ThirdPartyPasswordless from 'supertokens-node/recipe/thirdpartypasswordless';
import Dashboard from 'supertokens-node/recipe/dashboard';
import AccountLinking from "supertokens-node/recipe/accountlinking"
import { AccountInfoWithRecipeId } from "supertokens-node/recipe/accountlinking/types";
import axios from "axios";
import { createHash } from "crypto"
import { ConfigInjectionToken, AuthModuleConfig } from "./config.interface";

function fireEvent(eventName: string, eventMetadata: any) {
    console.log("Firing event: ", eventName, eventMetadata);
}

async function isBreachedPassword(password: string) {
    // send first 5 characters to pwnedpasswords API
    // if response contains the rest of the hash,
    // then password is breached
    let shasum = createHash('sha1');
    shasum.update(password);
    password = shasum.digest('hex');
    let response = await new Promise<boolean>((resolve, reject) => {
        axios.get("https://api.pwnedpasswords.com/range/" + password.substring(0, 5))
            .then((response) => {
                let hashSuffix = password.substring(5).toUpperCase();
                let hashes = response.data.split("\n");
                for (let i = 0; i < hashes.length; i++) {
                    if (hashes[i].split(":")[0] === hashSuffix) {
                        resolve(true);
                    }
                }
                resolve(false);
            })
            .catch((err) => {
                reject(err);
            })
    });
    return response;
}

@Injectable()
export class SupertokensService {
    constructor(@Inject(ConfigInjectionToken) private config: AuthModuleConfig) {
        supertokens.init({
            appInfo: config.appInfo,
            supertokens: {
                connectionURI: config.connectionURI,
                apiKey: config.apiKey,
            },
            recipeList: [
                AccountLinking.init({
                    shouldDoAutomaticAccountLinking: async (newAccountInfo: AccountInfoWithRecipeId & { recipeUserId?: RecipeUserId }, user: User | undefined, tenantId: string, userContext: any) => {
                        return {
                            shouldAutomaticallyLink: true,
                            shouldRequireVerification: false
                        }
                    }
                }),
                ThirdPartyEmailPassword.init({
                    override: {
                        apis: (oI) => {
                            return {
                                ...oI,
                                passwordResetPOST: async function (input) {
                                    try {
                                        return await oI.passwordResetPOST!(input);
                                    } catch (err) {
                                        if (err.message === "Password breached") {
                                            return {
                                                status: "GENERAL_ERROR",
                                                message: "Please use another password since this password has been breached"
                                            }
                                        }
                                        throw err;
                                    }
                                },
                                emailPasswordSignUpPOST: async function (input) {
                                    try {
                                        return await oI.emailPasswordSignUpPOST!(input);
                                    } catch (err) {
                                        if (err.message === "Password breached") {
                                            return {
                                                status: "GENERAL_ERROR",
                                                message: "Please use another password since this password has been breached"
                                            }
                                        }
                                        throw err;
                                    }
                                }
                            }
                        },
                        functions: (oI) => {
                            return {
                                ...oI,
                                updateEmailOrPassword: async (input) => {
                                    if (input.password !== undefined && await isBreachedPassword(input.password)) {
                                        throw new Error("Password breached");
                                    }
                                    return await oI.updateEmailOrPassword(input);
                                },
                                emailPasswordSignUp: async (input) => {
                                    if (await isBreachedPassword(input.password)) {
                                        throw new Error("Password breached");
                                    }
                                    let response = await oI.emailPasswordSignUp(input);
                                    if (response.status === "OK" && response.user.loginMethods.length === 1) {
                                        fireEvent("signup", { userId: response.user.id, email: response.user.emails[0] })
                                    }
                                    return response;
                                },
                                thirdPartySignInUp: async (input) => {
                                    let response = await oI.thirdPartySignInUp(input);

                                    if (response.status === "OK") {

                                        let accessToken = response.oAuthTokens["access_token"];

                                        let firstName = response.rawUserInfoFromProvider.fromUserInfoAPI!["first_name"];

                                        if (response.createdNewRecipeUser && response.user.loginMethods.length === 1) {
                                            fireEvent("signup", { userId: response.user.id, email: response.user.emails[0] })
                                        }
                                    }

                                    return response;
                                }
                            }
                        }
                    }
                }),
                ThirdPartyPasswordless.init({
                    contactMethod: "EMAIL",
                    flowType: "USER_INPUT_CODE_AND_MAGIC_LINK",
                    override: {
                        functions: (oI) => {
                            return {
                                ...oI,
                                consumeCode: async (input) => {
                                    let response = await oI.consumeCode(input);
                                    if (response.status === "OK" && response.user.loginMethods.length === 1) {
                                        fireEvent("signup", { userId: response.user.id, email: response.user.emails[0] })
                                    }
                                    return response;
                                },
                                thirdPartySignInUp: async (input) => {
                                    let response = await oI.thirdPartySignInUp(input);

                                    if (response.status === "OK") {

                                        let accessToken = response.oAuthTokens["access_token"];

                                        let firstName = response.rawUserInfoFromProvider.fromUserInfoAPI!["first_name"];

                                        if (response.createdNewRecipeUser && response.user.loginMethods.length === 1) {
                                            fireEvent("signup", { userId: response.user.id, email: response.user.emails[0] })
                                        }
                                    }

                                    return response;
                                }
                            }
                        }
                    }
                }),
                Dashboard.init(),
                Session.init(),
            ]
        });
    }
}