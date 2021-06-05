require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const webpush = require('web-push');
const app = express();

app.use(cors());
app.use(bodyParser.json());

const port = 4000;
const vapidKeys = {
  publicKey: process.env.PUBLIC_KEY,
  privateKey: process.env.PRIVATE_KEY,
	mailTo: process.env.MAIL_TO
};

//setting our previously generated VAPID keys
webpush.setVapidDetails(
  vapidKeys.mailTo,
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// dummy in memory store
const dummyDb = { subscription: null };

const saveToDatabase = async subscription => {
  // Since this is a demo app, I am going to save this in a dummy in memory store. Do not do this in your apps.
  // Here you should be writing your db logic to save it.
  dummyDb.subscription = subscription;
}

// The new /save-subscription endpoint
app.post('/save-subscription', async (req, res) => {
  const subscription = req.body;
	// Method to save the subscription to Database
  await saveToDatabase(subscription);
  res.json({ message: 'success' });
})

//function to send the notification to the subscribed device
const sendNotification = async ({ subscription, message='' }) => {
	webpush.sendNotification(subscription, message)
		.then((success) => {
			console.log(success);
		})
		.catch((err) => {
			console.error(err);
		});
}

//route to test send notification
app.get('/send-notification', async (req, res) => {
	//get subscription from your databse here.
  const subscription = dummyDb.subscription;
	if (!subscription) {
		return res.status(404).json({ message: 'unable to find subscription' });
	}
  const message = 'Hello World';
  await sendNotification({ subscription, message });
  res.json({ message: 'message sent' });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));