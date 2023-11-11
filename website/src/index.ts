import { DropDownInput, Grid, Page, TextInput, Vertical, View, WebGen, Wizard } from "webgen/mod.ts";
import presentations from "../presentations.json" assert { type: "json" };
import topics from "../topics.json" assert { type: "json" };
import zod from "https://deno.land/x/zod@v3.22.2/index.ts";

WebGen();

const validator = zod.object({
    name: zod.string({ invalid_type_error: "Fehlender Name" }),
    p1: zod.string({ invalid_type_error: "Vortrag 1 fehlt" }),
    p2: zod.string({ invalid_type_error: "Vortrag 2 fehlt" }),
    p3: zod.string({ invalid_type_error: "Vortrag 3 fehlt" }),
    p4: zod.string({ invalid_type_error: "Vortrag 4 fehlt" }),
})

View(() => Vertical(
    Wizard({
        submitAction: async ([ { data: { data } } ]) => {
            await fetch("/submit", {
                method: "POST",
                body: JSON.stringify(data)
            });

            alert("Abgesendet!")
        },
        buttonAlignment: "top",
        buttonArrangement: "flex-end"
        //buttonArrangement: (actions) => Horizontal(Spacer(), Button("Absenden")).setMargin("20px 0"),
    }, () => [
        Page({
            name: undefined,
            p1: undefined,
            p2: undefined,
            p3: undefined,
            p4: undefined
        }, (data) => [
            Grid(
                TextInput("text", "Name").sync(data, "name").setWidth("20rem"),
                DropDownInput("Vortrag 1 (14:00 - 14:20)", presentations[ 0 ].presentations.map(x => `${x.id[ 3 ] ? `${x.id[ 3 ]}:` : ""} ${topics.find(z => z.id == x.id.substring(0, 3))!.title}`)).sync(data, "p1"),
                DropDownInput("Vortrag 2 (14:30 - 15:00)", presentations[ 1 ].presentations.map(x => `${x.id[ 3 ] ? `${x.id[ 3 ]}:` : ""} ${topics.find(z => z.id == x.id.substring(0, 3))!.title}`)).sync(data, "p2"),
                DropDownInput("Vortrag 3 (15:10 - 15:20)", presentations[ 2 ].presentations.map(x => `${x.id[ 3 ] ? `${x.id[ 3 ]}:` : ""} ${topics.find(z => z.id == x.id.substring(0, 3))!.title}`)).sync(data, "p3"),
                DropDownInput("Vortrag 4 (15:30 - 15:50)", presentations[ 3 ].presentations.map(x => `${x.id[ 3 ] ? `${x.id[ 3 ]}:` : ""} ${topics.find(z => z.id == x.id.substring(0, 3))!.title}`)).sync(data, "p4"),
            ).setGap("20px").setAlign("center")
        ])
            .setValidator(() => validator)
    ])
).setGap("20px").setPadding("190px 20px 20px")
)
    .setMaxWidth("75rem")
    .appendOn(document.body);