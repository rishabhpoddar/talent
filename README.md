# Demo app with multi tenancy, NextJS frontend and NestJS backend

## Setup and running the app

### Start nextjs

This will start NextJS on `http://localhost:3000`

```bash
npm i
npm run dev
```

This will start the NestJS backend on `http://localhost:3001`

```bash
cd nestjs-backend
npm i
npm run start:dev
```

## cURL commands to create and configure tenants

This project relies on certain tenants to be created in the SuperTokens core. Below are the curl commands to create and configure the tenants.

```bash
curl --location --request PUT 'https://st-dev-6c18c3b0-c96b-11ee-813b-df2fdf122adb.aws.supertokens.io/appid-talent/recipe/multitenancy/tenant' \
--header 'Content-Type: application/json' \
--header 'api-key: 2o3EmNQGPQ3YaC6kbAcB33keTv' \
--data-raw '{
    "tenantId": "tenant1",
    "emailPasswordEnabled": true,
    "thirdPartyEnabled": true,
    "passwordlessEnabled": false
}'

curl --location --request PUT 'https://st-dev-6c18c3b0-c96b-11ee-813b-df2fdf122adb.aws.supertokens.io/appid-talent/tenant1/recipe/multitenancy/config/thirdparty' \
--header 'Content-Type: application/json' \
--header 'api-key: 2o3EmNQGPQ3YaC6kbAcB33keTv' \
--data-raw '{
  "config": {
    "thirdPartyId": "google-workspaces",
    "name": "Google Workspaces",
    "clients": [
      {
        "clientId": "1060725074195-kmeum4crr01uirfl2op9kd5acmi9jutn.apps.googleusercontent.com",
        "clientSecret": "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",
        "additionalConfig": {
            "hd": "*"
        }
      }
    ]
  }
}'


curl --location --request PUT 'https://st-dev-6c18c3b0-c96b-11ee-813b-df2fdf122adb.aws.supertokens.io/appid-talent/recipe/multitenancy/tenant' \
--header 'Content-Type: application/json' \
--header 'api-key: 2o3EmNQGPQ3YaC6kbAcB33keTv' \
--data-raw '{
    "tenantId": "tenant2",
    "emailPasswordEnabled": true,
    "thirdPartyEnabled": false,
    "passwordlessEnabled": false
}'

curl --location --request PUT 'https://st-dev-6c18c3b0-c96b-11ee-813b-df2fdf122adb.aws.supertokens.io/appid-talent/recipe/multitenancy/tenant' \
--header 'Content-Type: application/json' \
--header 'api-key: 2o3EmNQGPQ3YaC6kbAcB33keTv' \
--data-raw '{
    "tenantId": "tenant3",
    "emailPasswordEnabled": false,
    "thirdPartyEnabled": true,
    "passwordlessEnabled": true
}'


curl --location --request PUT 'https://st-dev-6c18c3b0-c96b-11ee-813b-df2fdf122adb.aws.supertokens.io/appid-talent/tenant3/recipe/multitenancy/config/thirdparty' \
--header 'Content-Type: application/json' \
--header 'api-key: 2o3EmNQGPQ3YaC6kbAcB33keTv' \
--data-raw '{
  "config": {
    "thirdPartyId": "github",
    "name": "GitHub",
    "clients": [
      {
        "clientId": "467101b197249757c71f",
        "clientSecret": "e97051221f4b6426e8fe8d51486396703012f5bd"
      }
    ]
  }
}'
```

### Get information on MAUs and DAUs

The SuperTokens core keeps track of the MAU count. To get the total number of MAUs since a certain date, you can use the following curl command:

```bash
curl --location --request GET 'https://st-dev-6c18c3b0-c96b-11ee-813b-df2fdf122adb.aws.supertokens.io/appid-talent/users/count/active?since=1709663400000' \
--header 'api-key: 2o3EmNQGPQ3YaC6kbAcB33keTv'
```

The query param `since` (time in MS since epoch) specifies the time from which you want to get the MAU count. So if you want to get the current DAU, you will have to set `since` to the current time minus 24 hours. If you want to get the MAU count for the last 30 days, you will have to set `since` to the current time minus 30 days.