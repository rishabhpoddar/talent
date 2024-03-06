import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [AuthModule.forRoot({
    connectionURI: "https://st-dev-6c18c3b0-c96b-11ee-813b-df2fdf122adb.aws.supertokens.io/appid-talent",
    apiKey: "2o3EmNQGPQ3YaC6kbAcB33keTv",
    appInfo: {
      // Learn more about this on https://supertokens.com/docs/thirdpartyemailpassword/appinfo
      appName: "SuperTokens Demo app",
      apiDomain: "http://localhost:3001",
      websiteDomain: "http://localhost:3000",
      apiBasePath: "/auth",
      websiteBasePath: "/auth"
    },
  })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
