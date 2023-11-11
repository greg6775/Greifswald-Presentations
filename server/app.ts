import { serveDir } from "std/http/file_server.ts";
import { MongoClient } from "mongo/mod.ts";

const client = new MongoClient();

await client.connect("mongo://mongodb-mirror.bbn-one:27017");

const db = client.database("mcb_greifswald");

await Deno.serve({ port: 8080 }, async (req) => {
    const url = new URL(req.url)
    if (url.pathname == "/submit" && req.method == "POST") {
        const body = new TextDecoder().decode(await req.arrayBuffer());
        const data = JSON.parse(body);
        const collection = db.collection("submissions");
        await collection.insertOne(data);
        return new Response()
    }
    return serveDir(req, {
        fsRoot: "./dist",
    });
}).finished;