# Rust Wipe Countdown bot
## Description
A discord.js bot that is capable to display server information and wipe dates. It updates wipe times at every midnight. (it also updates if you restart it, so you can leave the bot offline and start it after every wipe.)
## Here is how it looks like
![Example](https://cdn.discordapp.com/attachments/956232582738116690/959150058111127582/unknown.png)  
## Set-up Guide:
Install [node.js](https://nodejs.org/en/)
Download the repository  
Create a [discord bot](https://discord.com/developers/applications)  
**Don't forget to enable gateway intents**
Invite the bot to your server.
Open powershell in the project's folder and run **npm install**  
**Rename config.example.json to config.json**  
You can set everything in the config file.
Use [this site](https://timestampgenerator.com/) to create timestamps for the wipe. You need to do this process only once, wipe times will be updated automatically.
Run the bot with **node .** or **node index.js**