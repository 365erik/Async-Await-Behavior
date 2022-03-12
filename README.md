# Async Await Behavior


Demonstrate async/await function behavior in comparison with standard synchronous behavior.

https://replit.com/@365Erik/Async-Await-Behavior

## A Promise to Share

We often find promises implemented _in situ_ like `p.then().catch().finally()` but a variable pointing to a promise can be referenced in multiple locations of your code base. Here we create a single promise for use in two functions: one async and one standard.

```javascript
const sharedPromise = new Promise((resolve) => {
  setTimeout(() => resolve("sharedPromise has resolved"), 1000);
});
```

## Async Implementation

```javascript
const asyncFunc = async () => {
  console.log(`asyncFunc sees ${await sharedPromise}`);
  console.log("asyncFunc's second statement fires only after sharedPromise has resolved");
}

asyncFunc();
console.log("asyncFunc is moved into the queue and the program executes the next statement");
```

```
asyncFunc is moved into the queue and the program executes the next statement
asyncFunc sees sharedPromise has resolved
asyncFunc's second statement fires only after sharedPromise has resolved
```

In the above implementation, `await sharedPromise` introduces blocking behavior within the function execution context. This means the stack will not proceed to the next line within the function until the awaited promise resolves. The entire function execution stack is put in a queue until the promise resolves to unblock it. Meanwhile, the rest of the application continues moving forward, and prints the message _asyncFunc is moved into the queue..._ while `asyncFunc` awaits the resolution of our sharedPromise. 

## Standard Function

```javascript
const syncFunc = () => {
  sharedPromise.then(result => console.log(`syncFunc sees ${result}`));
  console.log("syncFunc's second statement fires immediately without waiting for sharedPromise to resolve");
}

syncFunc();
console.log("syncFunc exits immediately and the program moves onto the next statement");
```

```
syncFunc's second statement fires immediately without waiting for sharedPromise to resolve
syncFunc exits immediately and the program moves onto the next statement
syncFunc sees sharedPromise has resolved
```

Above, we're using a regular function and the `p.then(result => console.log(result))` pattern to log when `sharedPromise` resolves. There is no blocking behavior within the function context, so we proceed through the statements, exit the function, and onto the final `console.log` statement. We'll get a message that _syncFunc sees sharedPromise has resolved_  about one second later.

## Altogether, Now

```javascript
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
```

```
first statement after asyncFunc
syncFunc's second statement fires immediately without waiting for sharedPromise to resolve
first statement after syncFunc
asyncFunc sees sharedPromise has resolved
asyncFunc's second statement fires only after sharedPromise has resolved
syncFunc sees sharedPromise has resolved
```

Below is a rough representation of what is happening in our callstack to explain the _seemingly_ shuffled up results, which despite appearances are in correct and linear order. 

```
call asyncFunc
|-- console.log must await sharedPromised resolution
|-- move asyncFunc into the queue
|-- check queue

console.log **first statement after asyncFunc**

check queue

call syncFunc
|-- check queue
|-- set up a promise chain with `sharedPromise.then()` and put in queue
|- check queue
|- console.log **syncFunc's second statement fires immediately...**

check queue

console.log **first statement after syncFunc**

check queue repeatedly

check queue: sharedPromise has resolved!

put asyncFunc back on the callstack
|_ console.log **asyncFunc sees sharedPromise has resolved**
|_ console.log **asyncFunc's second statement fires only after...**

put syncFunc->sharedPromise.then statement back on stack
|_ console.log **syncFunc sees sharedPromise has resolved**

```
