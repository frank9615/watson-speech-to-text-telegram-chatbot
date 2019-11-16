var Bot = require('node-telegram-bot-api')
const SpeechToTextV1 = require('ibm-watson/speech-to-text/v1');
const { IamAuthenticator } = require('ibm-watson/auth');
var request = require('request');
var config = require('./config');

const speechToText = new SpeechToTextV1({
	authenticator: new IamAuthenticator({ apikey: Config.getWatsonKey() }),
	url: 'https://gateway-lon.watsonplatform.net/speech-to-text/api'
});

var params = {
	contentType: 'audio/ogg;codecs=opus',
	continuous: true,
	interimResults: false
};

var bot = new Bot(config.telegram.token, { polling: true });

bot.on('message', function (msg) {
	if (msg.hasOwnProperty('voice')) {
		return onVoiceMessage(msg);
	}
});

function onVoiceMessage(msg) {
	const chatId = msg.chat.id;
	bot.getFileLink(msg.voice.file_id).then(function (link) {
		var recognizeStream = speechToText.recognizeUsingWebSocket(params);
		recognizeStream.setEncoding('utf8');
		recognizeStream.on('data', function (data) {
			console.log('result: ', data);
			bot.sendMessage(chatId, data)
		});
		request(link).pipe(recognizeStream);
	});
}