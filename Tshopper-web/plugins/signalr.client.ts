import { HubConnectionBuilder, type HubConnection } from "@microsoft/signalr";

export default defineNuxtPlugin((nuxtApp) => {
  // const config = useRuntimeConfig(); // TODO use config
  const connection: HubConnection = new HubConnectionBuilder()
    .withUrl(`http://localhost:5157/shoppingListHub`)
    .withAutomaticReconnect()
    .build();

  connection
    .start()
    .then(() => console.log("✅ SignalR Connected!"))
    .catch((err) => console.error("❌ SignalR Connection Error:", err));

  // Provide the connection globally
  nuxtApp.provide("signalr", connection);
});
