"use strict";
const path = require("path");

module.exports = function (plop) {
  plop.setGenerator("component", {
    description: "Generic React / TypeScript Component",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "Input Component Name",
      },
    ],
    actions: [
      {
        type: "add",
        path: "renderer/components/{{name}}/{{name}}.tsx",
        templateFile: "renderer/generators/GenericComponent/GenComponent.tsx",
      },
      {
        type: "add",
        path: "renderer/components/{{name}}/{{name}}.module.scss",
        templateFile:
          "renderer/generators/GenericComponent/GenComponent.module.scss",
      },
      {
        type: "add",
        path: "renderer/components/{{name}}/{{name}}.d.ts",
        templateFile: "renderer/generators/GenericComponent/GenComponent.d.ts",
      },
    ],
  });

  plop.setGenerator("hook", {
    description: "Generic React / TypeScript Hook",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "Input Hook Name",
      },
    ],
    actions: [
      {
        type: "add",
        path: "renderer/hooks/use{{name}}.ts",
        templateFile: "renderer/generators/GenericHook/useHook.ts",
      },
    ],
  });

  plop.setGenerator("context", {
    description: "Generic React / TypeScript Context",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "Input Context Name",
      },
    ],
    actions: [
      {
        type: "add",
        path: "renderer/context/{{name}}/{{name}}.ts",
        templateFile: "renderer/generators/GenericContext/GenericContext.ts",
      },
    ],
  });

  // setGenerator creates a generator that can be run with "plop generatorName"
  // plop.setGenerator("test", {
  //   description: "this is a test",
  //   prompts: [
  //     {
  //       type: "input",
  //       name: "name",
  //       message: "What is your name?",
  //       validate: function (value) {
  //         if (/.+/.test(value)) {
  //           return true;
  //         }
  //         return "name is required";
  //       },
  //     },
  //     {
  //       type: "input",
  //       name: "age",
  //       message: "How old are you?",
  //       validate: function (value) {
  //         var digitsOnly = /\d+/;
  //         if (digitsOnly.test(value)) {
  //           return true;
  //         }
  //         return "Invalid age! Must be a number genius!";
  //       },
  //     },
  //     {
  //       type: "checkbox",
  //       name: "toppings",
  //       message: "What pizza toppings do you like?",
  //       choices: [
  //         { name: "Cheese", value: "cheese", checked: true },
  //         { name: "Pepperoni", value: "pepperoni" },
  //         { name: "Pineapple", value: "pineapple" },
  //         { name: "Mushroom", value: "mushroom" },
  //         { name: "Bacon", value: "bacon", checked: true },
  //       ],
  //     },
  //   ],
  //   actions: [
  //     `this is a comment`,
  //     "this is another comment",
  //     delayLog("delayed thing"),
  //     delayLog("another delayed thing"),
  //     delayLog("this was also delayed"),
  //     {
  //       type: "add",
  //       path: "folder/{{dashCase name}}.txt",
  //       templateFile: "templates/burger.txt",
  //       abortOnFail: true,
  //     },
  //     function customAction(answers) {
  //       // move the current working directory to the plop file path
  //       // this allows this action to work even when the generator is
  //       // executed from inside a subdirectory
  //       process.chdir(plop.getPlopfilePath());
  //       // custom function can be synchronous or async (by returning a promise)
  //       var fs = require("fs");
  //       var existsMsg = "psst {{name}}, change-me.txt already exists";
  //       var copiedMsg = "hey {{name}}, I copied change-me.txt for you";
  //       var changeFileName = "change-me.txt";
  //       var changeFilePath =
  //         plop.getDestBasePath() + "/folder/" + changeFileName;
  //       // you can use plop.renderString to render templates
  //       existsMsg = plop.renderString(existsMsg, answers);
  //       copiedMsg = plop.renderString(copiedMsg, answers);
  //       if (fs.existsSync(changeFilePath)) {
  //         // returned value shows up in the console
  //         return existsMsg;
  //       } else {
  //         // do a synchronous copy via node fs
  //         fs.writeFileSync(
  //           changeFilePath,
  //           fs.readFileSync("templates/" + changeFileName)
  //         );
  //         return copiedMsg;
  //       }
  //     },
  //     {
  //       type: "modify",
  //       path: "folder/change-me.txt",
  //       pattern: /(-- APPEND ITEMS HERE --)/gi,
  //       template: "$1\r\n{{name}}: {{age}}",
  //     },
  //     {
  //       type: "modify",
  //       path: "folder/change-me.txt",
  //       pattern: /(-- PREPEND ITEMS HERE --)/gi,
  //       templateFile: "templates/part.txt",
  //     },
  //     {
  //       type: "modify",
  //       path: "folder/change-me.txt",
  //       pattern: /## replace name here ##/gi,
  //       template: "replaced => {{dashCase name}}",
  //     },
  //     {
  //       type: "modify",
  //       path: "folder/change-me.txt",
  //       skip(data) {
  //         if (!data.toppings.includes("mushroom")) {
  //           // Skip this action
  //           return "Skipped replacing mushrooms";
  //         } else {
  //           // Continue with this action
  //           return;
  //         }
  //       },
  //       transform(fileContents, data) {
  //         return fileContents.replace(/mushrooms/g, "pepperoni");
  //       },
  //     },
  //   ],
  // });
};
