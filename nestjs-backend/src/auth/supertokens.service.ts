import { Inject, Injectable } from '@nestjs/common';
import supertokens from "supertokens-node";
import Session from 'supertokens-node/recipe/session';
import ThirdPartyEmailPassword from 'supertokens-node/recipe/thirdpartyemailpassword';
import ThirdPartyPasswordless from 'supertokens-node/recipe/thirdpartypasswordless';
import Dashboard from 'supertokens-node/recipe/dashboard';

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