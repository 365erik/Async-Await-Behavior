console.log("Explained at https://dev.to/365erik/async-await-behavior-8if\n");

const sharedPromise = new Promise((resolve) => setTimeout(() => resolve("sharedPromise has resolved"), 1000));

const asyncFunc = async () => {
  console.log(`asyncFunc sees ${await sharedPromise}`);
  console.log("asyncFunc's second statement fires only after sharedPromise has resolved");
}

const syncFunc = () => {
  sharedPromise.then(result => console.log(`syncFunc sees ${result}`));
  console.log("syncFunc's second statement fires immediately without waiting for sharedPromise to resolve");
}

asyncFunc();
console.log("first statement after asyncFunc");
syncFunc();
console.log("first statement after syncFunc");