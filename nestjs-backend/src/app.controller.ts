import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from './auth/auth.guard';
import { SessionContainer } from "supertokens-node/recipe/session";
import { Session } from './auth/session.decorator';
import Multitenancy from "supertokens-node/recipe/multitenancy";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get('user')
  @UseGuards(new AuthGuard())
  async getUser(@Session() session: SessionContainer): Promise<string> {
    return JSON.stringify({
      note: "Fetch any data from your application for authenticated user after using verifySession middleware",
      userId: session.getUserId(),
      sessionHandle: session.getHandle(),
      accessTokenPayload: session.getAccessTokenPayload(),
    });
  }

  @Get('tenants')
  async getTenants(): Promise<string> {
    return JSON.stringify(await Multitenancy.listAllTenants());
  }
}
