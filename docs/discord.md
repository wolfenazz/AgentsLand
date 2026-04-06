To make your app show up on Discord like a real game (with its logo and name), you need to use **Discord Rich Presence**. Right now, Discord is just detecting your app as a generic process (“YzPzCode App”), which is why it shows a default icon.

Here’s how to fix it properly:

---

## ✅ 1. Create a Discord Application [ done ]

1. Go to: [https://discord.com/developers/applications](https://discord.com/developers/applications)
2. Click **“New Application”**
3. Name it **YzPzCode**
4. Go to **Rich Presence → Art Assets**

---

## 🎨 2. Upload Your App Logo

* In **Art Assets**, upload your logo as a **large image**
* Give it a key (e.g. `logo`)
* This key is important—you’ll use it in code

---

## 💻 3. Add Rich Presence to Your App

You need to integrate Discord’s RPC (Rich Presence SDK) into your app.

### Example (JavaScript / Electron / Node.js)

Install:

```bash
npm install discord-rpc
```

Code: // you can do it on TypeScripts if you want 

```js 
const RPC = require("discord-rpc");

const clientId = "1490701639362023464"; // from Discord Dev Portal
RPC.register(clientId);

const rpc = new RPC.Client({ transport: "ipc" });

rpc.on("ready", () => {
  rpc.setActivity({
    details: "Using YzPzCode",
    state: "Coding...",
    startTimestamp: new Date(),
    largeImageKey: "apppic", // MUST match what you uploaded
    largeImageText: "YzPzCode",
  });
});

rpc.login({ clientId }).catch(console.error);
```

---

## ⚠️ 4. Important Notes

* The image key (`logo`) must exactly match what you named it in Discord
* Discord must be running while testing
* Your app must actively set Rich Presence (it won’t work automatically)
* It may take a few minutes for uploaded images to become available

---

## 🧠 Why yours doesn’t show logo yet

Right now:

* Discord just sees your app process
* No Rich Presence = no custom logo
* So it uses a generic icon

---

## 🚀 Result

Once done, your app will show like:

* **YzPzCode**
* Custom logo
* Custom status (e.g. “Coding…”)

Just like a real game 🎮

---

If you tell me what language your app is built in (Python, C#, Electron, etc.), I can give you an exact working example for your setup.
