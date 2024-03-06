import { Inject, Injectable } from '@nestjs/common';
import supertokens, { User, RecipeUserId } from "supertokens-node";
import Session from 'supertokens-node/recipe/session';
import ThirdPartyEmailPassword from 'supertokens-node/recipe/thirdpartyemailpassword';
import ThirdPartyPasswordless from 'supertokens-node/recipe/thirdpartypasswordless';
import Dashboard from 'supertokens-node/recipe/dashboard';
import AccountLinking from "supertokens-node/recipe/accountlinking"
import { AccountInfoWithRecipeId } from "supertokens-node/recipe/accountlinking/types";


import { ConfigInjectionToken, AuthModuleConfig } from "./config.interface";

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
                ThirdPartyEmailPassword.init(),
                ThirdPartyPasswordless.init({
                    contactMethod: "EMAIL",
                    flowType: "USER_INPUT_CODE_AND_MAGIC_LINK",
                }),
                Dashboard.init(),
                Session.init(),
            ]
        });
    }
}