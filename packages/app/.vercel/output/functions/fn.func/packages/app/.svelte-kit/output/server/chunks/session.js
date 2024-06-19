import Dexie from "dexie";
class SessionDexie extends Dexie {
  accounts;
  // Account is the type of your account object
  constructor() {
    super("plebeian.session");
    this.version(1).stores({
      accounts: "hexPubKey, type, lastLogged, relays, cSk"
    });
    this.accounts = this.table("accounts");
  }
}
const sessions = new SessionDexie();
async function deleteAccount(hexPubKey) {
  await sessions.accounts.where("hexPubKey").equals(hexPubKey).delete();
}
export {
  deleteAccount as d
};
