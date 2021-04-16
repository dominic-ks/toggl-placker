# toggl-placker
A NodeJS script to automatically update Placker cards with Toggl time entries. When run on a cron, 
e.g. via Google Cloud Functions with pub-sub trigger attached to Google Cloud Scheduler, this script will repeatedly
search for Toggl time entries that were started within the last 6 hours and update Placker cards with the same name. 
The script will make two updates

 - Add the Toggl time entry's duration to the current total actual effort on the Placker card
 - Add the Toggl time entry's ID to the Placker card data so that the same time entry isn't counted twice
 
# Usage
- Clone this repo
- Update the .env sample failes as you need, I use:
  - .env for local testing
  - .env.yaml for passing environment variables to Google Cloud Functions
 
 # Deploy script
 I have also included a sample deploy script that I use, so you can use mine by running
 `$ npm run deploy`
 NB. that script is looking for a PubSub topic called five-minute-cron, so you'd need to set that up on your Google Cloud account if you are using that.
 
 I get it, you might not be using Google Cloud, but I am, so I thought it'd be helpful to share how I was using!.
 
 # PLEASE NOTE!
 This approach requires the description of the Toggl time entry to match the name of the Placker card, 
 to make this easier you can use the Toggl Browser Extension for Chrome or Firefox.
 This will add a Toggl timer button to cards in Placker and starting the timer will auto-populate the description from the card title
 
 As this script also looks back over 6 hours, it won't pick up any tasks that are longer than 6 hours. Maybe that should be an env variable... 
 Get in touch if you think so! Or feel free to contribute it!
