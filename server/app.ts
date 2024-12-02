import { serveDir } from "@std/http";
import { MongoClient } from "mongo/mod.ts";
import zod from "https://deno.land/x/zod@v3.23.8/mod.ts";
import presentations from "./presentations.json" with { type: "json" };

const client = new MongoClient();

await client.connect("mongo://mongo:27017");

const db = client.database("mcb_greifswald");

await Deno.serve({ port: 8080 }, async (req) => {
    const url = new URL(req.url)
    if (url.pathname == "/init" && req.method == "POST") {
        const { name } = await req.json();
        const submission = await db.collection("submissions").findOne({ name });
        const selected = submission ? [ presentations[ "14.00" ].find(x => x.id == submission.p1), presentations[ "14.30" ].find(x => x.id == submission.p2), presentations[ "15.00" ].find(x => x.id == submission.p3), presentations[ "15.30" ].find(x => x.id == submission.p4) ] : [];
        const submissions = await db.collection("submissions").find().toArray();
        const result = Object.fromEntries(Object.entries(presentations).map(([ time, presentations ]) => [
            time,
            presentations.filter(presentation => submissions.filter(submission => submission.p1 == presentation.id).length < 15)
        ]));
        return new Response(JSON.stringify({ presentations: result, selected }), { headers: { "content-type": "application/json", "Access-Control-Allow-Origin": "*" } });
    } else if (url.pathname == "/submit" && req.method == "POST") {
        const data = zod.object({
            name: zod.string({ required_error: "Fehlender Name" }),
            p1: zod.number({ required_error: "Vortrag 1 fehlt" }),
            p2: zod.number({ required_error: "Vortrag 2 fehlt" }),
            p3: zod.number({ required_error: "Vortrag 3 fehlt" }),
            p4: zod.number({ required_error: "Vortrag 4 fehlt" }),
        }).parse(await req.json());

        //count submissions
        if ((await db.collection("submissions").find({ p1: data.p1 }).toArray()).length > 14)
            return new Response("Vortrag 1 ist schon voll", { status: 400 });
        if ((await db.collection("submissions").find({ p2: data.p2 }).toArray()).length > 14)
            return new Response("Vortrag 2 ist schon voll", { status: 400 });
        if ((await db.collection("submissions").find({ p3: data.p3 }).toArray()).length > 14)
            return new Response("Vortrag 3 ist schon voll", { status: 400 });
        if ((await db.collection("submissions").find({ p4: data.p4 }).toArray()).length > 14)
            return new Response("Vortrag 4 ist schon voll", { status: 400 });

        const collection = db.collection("submissions");
        await collection.updateOne({ name: data.name }, {
            $set: data
        }, { upsert: true });
        return new Response();
    }
    return serveDir(req, {
        fsRoot: "./dist",
    });
}).finished
