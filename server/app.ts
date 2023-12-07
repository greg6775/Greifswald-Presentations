import { serveDir } from "std/http/file_server.ts";
import { MongoClient } from "mongo/mod.ts";
import zod from "https://deno.land/x/zod@v3.22.4/index.ts";

const client = new MongoClient();

await client.connect("mongo://mongodb-mirror.bbn-one:27017");

const db = client.database("mcb_greifswald");

await Deno.serve({ port: 8080 }, async (req) => {
    const url = new URL(req.url)
    if (url.pathname == "/submit" && req.method == "POST") {
        const body = new TextDecoder().decode(await req.arrayBuffer());
        const data = zod.object({
            name: zod.string({ invalid_type_error: "Fehlender Name" }),
            p1: zod.string({ invalid_type_error: "Vortrag 1 fehlt" }),
            p2: zod.string({ invalid_type_error: "Vortrag 2 fehlt" }),
            p3: zod.string({ invalid_type_error: "Vortrag 3 fehlt" }),
            p4: zod.string({ invalid_type_error: "Vortrag 4 fehlt" }),
        }).parse(JSON.parse(body));

        //count submissions
        if ((await db.collection("submissions").find({ p1: data.p1 }).toArray()).length > 20)
            return new Response("Vortrag 1 ist schon voll", { status: 400 });
        if ((await db.collection("submissions").find({ p2: data.p2 }).toArray()).length > 20)
            return new Response("Vortrag 2 ist schon voll", { status: 400 });
        if ((await db.collection("submissions").find({ p3: data.p3 }).toArray()).length > 20)
            return new Response("Vortrag 3 ist schon voll", { status: 400 });
        if ((await db.collection("submissions").find({ p4: data.p4 }).toArray()).length > 20)
            return new Response("Vortrag 4 ist schon voll", { status: 400 });

        const collection = db.collection("submissions");
        await collection.updateOne({ name: data.name }, {
            $set: data
        }, { upsert: true });
        return new Response()
    }
    return serveDir(req, {
        fsRoot: "./dist",
    });
}).finished;