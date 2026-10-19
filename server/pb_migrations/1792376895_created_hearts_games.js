/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    "createRule": "@request.auth.collectionName = \"users\" && @request.auth.hearts_role = \"editor\"",
    "deleteRule": "@request.auth.collectionName = \"users\" && @request.auth.hearts_role = \"editor\"",
    "fields": [
      {
        "autogeneratePattern": "[a-z0-9]{15}",
        "help": "",
        "hidden": false,
        "id": "text3208210256",
        "max": 15,
        "min": 15,
        "name": "id",
        "pattern": "^[a-z0-9]+$",
        "presentable": false,
        "primaryKey": true,
        "required": true,
        "system": true,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "help": "",
        "hidden": false,
        "id": "text2324736937",
        "max": 100,
        "min": 0,
        "name": "key",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": true,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "help": "",
        "hidden": false,
        "id": "text473765221",
        "max": 0,
        "min": 0,
        "name": "ended_at",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "help": "",
        "hidden": false,
        "id": "bool2744045131",
        "name": "early",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "bool"
      },
      {
        "help": "",
        "hidden": false,
        "id": "number1714303992",
        "max": null,
        "min": null,
        "name": "hands",
        "onlyInt": false,
        "presentable": false,
        "required": false,
        "system": false,
        "type": "number"
      },
      {
        "help": "",
        "hidden": false,
        "id": "json642663334",
        "maxSize": 0,
        "name": "players",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      },
      {
        "help": "",
        "hidden": false,
        "id": "json1776647634",
        "maxSize": 0,
        "name": "finals",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      },
      {
        "help": "",
        "hidden": false,
        "id": "json4240053356",
        "maxSize": 0,
        "name": "winners",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      },
      {
        "help": "",
        "hidden": false,
        "id": "json3040626950",
        "maxSize": 0,
        "name": "moons",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      }
    ],
    "id": "pbc_4070774058",
    "indexes": [
      "CREATE UNIQUE INDEX `idx_hearts_games_key` ON `hearts_games` (`key`)"
    ],
    "listRule": "@request.auth.collectionName = \"users\" && @request.auth.hearts_role != \"\"",
    "name": "hearts_games",
    "system": false,
    "type": "base",
    "updateRule": "@request.auth.collectionName = \"users\" && @request.auth.hearts_role = \"editor\"",
    "viewRule": "@request.auth.collectionName = \"users\" && @request.auth.hearts_role != \"\""
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_4070774058");

  return app.delete(collection);
})
