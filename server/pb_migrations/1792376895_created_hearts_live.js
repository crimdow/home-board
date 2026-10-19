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
        "help": "",
        "hidden": false,
        "id": "json2744374011",
        "maxSize": 0,
        "name": "state",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      },
      {
        "autogeneratePattern": "",
        "help": "",
        "hidden": false,
        "id": "text385774305",
        "max": 0,
        "min": 0,
        "name": "updated_by",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "help": "",
        "hidden": false,
        "id": "text1130519967",
        "max": 0,
        "min": 0,
        "name": "updated_at",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      }
    ],
    "id": "pbc_3193637157",
    "indexes": [
      "CREATE UNIQUE INDEX `idx_hearts_live_key` ON `hearts_live` (`key`)"
    ],
    "listRule": "@request.auth.collectionName = \"users\" && @request.auth.hearts_role != \"\"",
    "name": "hearts_live",
    "system": false,
    "type": "base",
    "updateRule": "@request.auth.collectionName = \"users\" && @request.auth.hearts_role = \"editor\"",
    "viewRule": "@request.auth.collectionName = \"users\" && @request.auth.hearts_role != \"\""
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3193637157");

  return app.delete(collection);
})
