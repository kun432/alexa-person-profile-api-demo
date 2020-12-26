// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
// Licensed under the Amazon Software License  http://aws.amazon.com/asl/

const Alexa = require('ask-sdk-core');

const MODE = "fullname";  // 姓名(fullname) or 姓名のみ（fullname以外）は排他。変更する場合は開発者コンソールのツール→権限も修正する。

let PERMISSIONS;
if (MODE == "fullname") {
    PERMISSIONS = ['alexa::profile:mobile_number:read', 'alexa::profile:name:read']
} else {
    PERMISSIONS = ['alexa::profile:mobile_number:read', 'alexa::profile:given_name:read']
}

const LaunchRequest = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        let nameText = MODE == "fullname" ? 'フルネーム' : '名前';
        let speechText = '音声プロフィールAPIのデモです。';
        let repromptText = `あなたの、${nameText}、電話番号の、どちらを聞きたいですか？`;
        return handlerInput.responseBuilder.speak(speechText + repromptText)
            .reprompt(repromptText)
            .getResponse();
    },
};

const ProfileFullNameIntent = {
    canHandle(handlerInput) {
        return (
            handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === 'ProfileFullNameIntent' &&
            MODE == "fullname"
        );
    },
    async handle(handlerInput) {
        const person = handlerInput.requestEnvelope.context.System.person;
        const consentToken = handlerInput.requestEnvelope.context.System.apiAccessToken;

        if (person) {
            const personId = person.personId;
            console.log("Received personId: ", personId);
        } else {
            let speechText = '音声プロフィールが認識されませんでした。アレクサアプリから、音声プロフィールを有効にして再度お試しください。';
            return handlerInput.responseBuilder
                .speak(speechText)
                .getResponse();
        }

        try {
            const client = handlerInput.serviceClientFactory.getUpsServiceClient();
            const name = await client.getPersonsProfileName();

            console.log('Name successfully retrieved, now responding to user.');

            let response;
            let speechText;
            if (name == null) {
                speechText = '氏名が設定されていないようです。アレクサアプリで氏名を設定してください。';
                response = handlerInput.responseBuilder.speak(speechText)
                    .getResponse();
            } else {
                speechText = `あなたのフルネームは、 ${name} です。`;
                response = handlerInput.responseBuilder.speak(speechText)
                    .getResponse();
            }
            return response;
        } catch (error) {
            if (error.name !== 'ServiceError') {
                const response = handlerInput.responseBuilder.speak("すいません、うまくいかないようです。").getResponse();
                return response;
            }
            throw error;
        }
    }
};

const ProfileGivenNameIntent = {
    canHandle(handlerInput) {
        return (
            handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === 'ProfileGivenNameIntent' &&
            MODE != "fullname"
        );
    },
    async handle(handlerInput) {
        const person = handlerInput.requestEnvelope.context.System.person;
        const consentToken = handlerInput.requestEnvelope.context.System.apiAccessToken;

        if (person) {
            const personId = person.personId;
            console.log("Received personId: ", personId);
        } else {
            let speechText = '音声プロフィールが登録されていません。アレクサアプリから、音声プロフィールを登録して再度お試しください。';
            return handlerInput.responseBuilder
                .speak(speechText)
                .getResponse();
        }

        try {
            const client = handlerInput.serviceClientFactory.getUpsServiceClient();
            const givenName = await client.getPersonsProfileGivenName();

            console.log('Given name successfully retrieved, now responding to user.');

            let response;
            let speechText;
            if (givenName == null) {
                speechText = '名前が設定されていないようです。アレクサアプリで名前を設定してください。';
                response = handlerInput.responseBuilder.speak(speechText)
                    .getResponse();
            } else {
                speechText = `あなたの名前は、${givenName} です。`;
                response = handlerInput.responseBuilder.speak(speechText)
                    .getResponse();
            }
            return response;
        } catch (error) {
            if (error.name !== 'ServiceError') {
                const response = handlerInput.responseBuilder.speak("すいません、うまくいかないようです。").getResponse();
                return response;
            }
            throw error;
        }
    }
};

const ProfileNumberIntent = {
    canHandle(handlerInput) {
        return (
            handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === 'ProfileNumberIntent'
        );
    },
    async handle(handlerInput) {
        const person = handlerInput.requestEnvelope.context.System.person;
        const consentToken = handlerInput.requestEnvelope.context.System.apiAccessToken;

        if (person) {
            const personId = person.personId;
            console.log("Received personId: ", personId);
        } else {
            let speechText = '音声プロフィールが登録されていません。アレクサアプリから、音声プロフィールを登録して再度お試しください。';
            return handlerInput.responseBuilder
                .speak(speechText)
                .getResponse();
        }

        try {
            const client = handlerInput.serviceClientFactory.getUpsServiceClient();
            const number = await client.getPersonsProfileMobileNumber();

            console.log('Number successfully retrieved, now responding to user.');

            let response;
            let speechText;
            if (number == null) {
                speechText = '電話番号が設定されていないようです。アレクサアプリで電話番号を設定してください。';
                response = handlerInput.responseBuilder.speak(speechText)
                    .getResponse();
            } else {
                speechText = `あなたの電話番号は、<say-as interpret-as="telephone">${number.countryCode} ${number.phoneNumber}</say-as> です。`;
                response = handlerInput.responseBuilder.speak(speechText)
                    .getResponse();
            }
            return response;
        } catch (error) {
            if (error.name !== 'ServiceError') {
                const response = handlerInput.responseBuilder.speak("すいません、うまくいかないようです。").getResponse();
                return response;
            }
            throw error;
        }
    }
};

const SessionEndedRequest = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

        return handlerInput.responseBuilder.getResponse();
    },
};

const UnhandledIntent = {
    canHandle() {
        return true;
    },
    handle(handlerInput) {
        let nameText = MODE == "fullname" ? 'フルネーム' : '名前';
        let speechText = `すいません、それはサポートされていません。例えば、私の${nameText}を教えて？というふうに言ってみてください。`;
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    },
};

const HelpIntent = {
    canHandle(handlerInput) {
        const {
            request
        } = handlerInput.requestEnvelope;

        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        let nameText = MODE == "fullname" ? 'フルネーム' : '名前';
        let speechText = `例えば、私の${nameText}名前を教えて？というふうに言ってみてください。`;
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    },
};

const StopAndCancelIntent = {
    canHandle(handlerInput) {
        const {
            request
        } = handlerInput.requestEnvelope;

        return request.type === 'IntentRequest' && 
            ( request.intent.name === 'AMAZON.StopIntent' || request.intent.name === 'AMAZON.CancelIntent' )
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak("さようなら、またね。")
            .getResponse();
    },
};

const ProfileError = {
    canHandle(handlerInput, error) {
        return error.name === 'ServiceError';
    },
    handle(handlerInput, error) {
        if (error.statusCode === 403) {
            let nameText = MODE == "fullname" ? '氏名' : '名前';
            let speechText = `音声プロフィールのアクセス権が許可されていません。アレクサアプリでこのスキルの設定画面を開き、音声プロフィールから${nameText}と電話番号への権限を許可してください。`;
            return handlerInput.responseBuilder
                .speak(speechText)
                .withAskForPermissionsConsentCard(PERMISSIONS)
                .getResponse();
        }
        let errorText = '音声プロフィールAPIへのアクセスでエラーが発生しました。もう一度やり直してください。';
        return handlerInput.responseBuilder
            .speak(errorText)
            .reprompt(errorText)
            .getResponse();
    },
};

// Reqest Interceptorを追加
const LogResponseInterceptor = {
  process(handlerInput) {
    console.log(`RESPONSE = ${JSON.stringify(handlerInput.responseBuilder.getResponse())}`);
  },
};

// Response Interceptorを追加
const LogRequestInterceptor = {
  process(handlerInput) {
    console.log(`REQUEST ENVELOPE = ${JSON.stringify(handlerInput.requestEnvelope)}`);
  },
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
    .addRequestHandlers(
        LaunchRequest,
        ProfileGivenNameIntent,
        ProfileFullNameIntent,
        ProfileNumberIntent,
        SessionEndedRequest,
        HelpIntent,
        StopAndCancelIntent,
        UnhandledIntent,
    )
    .addErrorHandlers(ProfileError)
    .withApiClient(new Alexa.DefaultApiClient())
    .addRequestInterceptors(LogRequestInterceptor)
    .addResponseInterceptors(LogResponseInterceptor)
    .withCustomUserAgent('cookbook/customer-profile/v1')
    .lambda(); // The identifier of the recognized speaker.
