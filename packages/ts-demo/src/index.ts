/*
   next-tick
   ┌───────────────────────────┐
┌─>│           timers          │
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │     pending callbacks     │
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │       idle, prepare       │
│  └─────────────┬─────────────┘      ┌───────────────┐
│  ┌─────────────┴─────────────┐      │   incoming:   │
│  │           poll            │<─────┤  connections, │
│  └─────────────┬─────────────┘      │   data, etc.  │
│  ┌─────────────┴─────────────┐      └───────────────┘
│  │           check           │
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
└──┤      close callbacks      │
   └───────────────────────────┘
 */
const baz = () => console.log('baz');
const foo = () => console.log('foo');
const zoo = () => console.log('zoo');
const start = () => {
  console.log('start2');
  setImmediate(baz);	// 被放入 check 队列, check phrase
  new Promise((resolve, reject) => {
    resolve('bar');
  }).then((resolve) => {	// 被放入 pending callbacks
    console.log(resolve);
    process.nextTick(zoo);	// 被放入 next tick 队列, 在下一轮循环的开始执行
  });
  process.nextTick(foo); // 被放入 next tick 队列, 在下一轮循环的开始执行
};
start();

// start foo bar zoo baz
