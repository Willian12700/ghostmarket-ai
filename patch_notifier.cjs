const fs = require('fs');
let content = fs.readFileSync('src/components/ui/SalesNotifier.tsx', 'utf8');

const newLogic = `  useEffect(() => {
    if (!user?.email) return

    let isFirstSnapshot = true;

    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', user.email)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (isFirstSnapshot) {
        isFirstSnapshot = false
        return
      }`;

let patched = false;
if (content.includes("if (isInitialLoad.current)")) {
  const startIdx = content.indexOf('useEffect(() => {');
  const endIdx = content.indexOf('snapshot.docChanges().forEach((change) => {');
  content = content.substring(0, startIdx) + newLogic + "\n      " + content.substring(endIdx);
  fs.writeFileSync('src/components/ui/SalesNotifier.tsx', content);
  console.log("Patched SalesNotifier");
  patched = true;
}
if (!patched) console.log("Failed");
