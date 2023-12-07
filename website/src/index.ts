import { Body, Button, Image, Center, Content, DropDownInput, Grid, Horizontal, Label, Sheet, Sheets, State, Vertical, WebGen, css, ref } from "webgen/mod.ts";
import presentations from "../presentations.json" assert { type: "json" };
// @deno-types="https://raw.githubusercontent.com/lucsoft-DevTeam/lucsoft.de/master/custom.d.ts"
import microsoftLogo from '../microsoftLogo.svg';
import topics from "../topics.json" assert { type: "json" };
//wait for zod updated webgen version before manually update zod
import zod from "https://deno.land/x/zod@v3.22.2/index.ts";
import { decodeBase64 } from "std/encoding/base64.ts";

WebGen();

document.adoptedStyleSheets.push(css`
.prefix-logo {
    position: absolute;
    left: .7rem;
    width: 1.2rem;
}
`)

const validation = zod.object({
    name: zod.string(),
    p1: zod.string({ invalid_type_error: "Vortrag 1 fehlt" }),
    p2: zod.string({ invalid_type_error: "Vortrag 2 fehlt" }),
    p3: zod.string({ invalid_type_error: "Vortrag 3 fehlt" }),
    p4: zod.string({ invalid_type_error: "Vortrag 4 fehlt" }),
})

const state = State({
    name: undefined,
    p1: undefined,
    p2: undefined,
    p3: undefined,
    p4: undefined
})

const sheets = Sheets(Content(Vertical(
    Grid(
        Label(ref`Name: ${state.$name}`),
        DropDownInput("Vortrag 1 (14:00 - 14:20)", presentations[ 0 ].presentations.map(x => x.id)).setRender((key) => `${key[ 3 ] ? `${key[ 3 ]}:` : ""} ${topics.find(z => z.id == key.substring(0, 3))!.title}`).sync(state, "p1"),
        DropDownInput("Vortrag 2 (14:30 - 15:00)", presentations[ 1 ].presentations.map(x => x.id)).setRender((key) => `${key[ 3 ] ? `${key[ 3 ]}:` : ""} ${topics.find(z => z.id == key.substring(0, 3))!.title}`).sync(state, "p2"),
        DropDownInput("Vortrag 3 (15:10 - 15:20)", presentations[ 2 ].presentations.map(x => x.id)).setRender((key) => `${key[ 3 ] ? `${key[ 3 ]}:` : ""} ${topics.find(z => z.id == key.substring(0, 3))!.title}`).sync(state, "p3"),
        DropDownInput("Vortrag 4 (15:30 - 15:50)", presentations[ 3 ].presentations.map(x => x.id)).setRender((key) => `${key[ 3 ] ? `${key[ 3 ]}:` : ""} ${topics.find(z => z.id == key.substring(0, 3))!.title}`).sync(state, "p4"),
    ).setGap("20px").setAlign("center").setMargin("20px 0px"),
    Horizontal(Button("Absenden").onPromiseClick(async () => {
        const data = await validation.safeParseAsync(state)
        if (!data.success)
            return alert(JSON.parse(data.error.message).map((x: any) => x.message))
        const req = await fetch("/submit", {
            method: "POST",
            body: JSON.stringify(data.data)
        });

        if (req.status != 200)
            alert(await req.text());
        else
            alert("Abgesendet!")
    })),
)
    .setGap("20px")
    .setPadding("250px 20px 20px"))
    .setMaxWidth("75rem")
)
    .setSheetWidth("min(calc(100% - 15px), 40rem)")
    .setSheetHeight("min(calc(100% - 15px), 20rem)");

const login = Sheet(
    Grid(
        Center(
            Label("Bitte anmelden!")
                .setTextSize("3xl")
                .setFontWeight("bold"),
        ),
        Center(Button("Mit Microsoft anmelden")
            .asLinkButton("https://login.microsoftonline.com/8dc6c618-bb35-4c9a-9c53-f92dfdb2aa25/oauth2/v2.0/authorize?client_id=63d40ad5-5d88-40c1-b7b9-4f873cd7b601&response_type=id_token&redirect_uri=https%3A%2F%2Fgreifswald.greg.yachts&scope=openid%20profile&nonce=123")
            .setJustify("center")
            .setMargin("0 0 .6rem")
            .setPadding("0 20 0 40")
            .addPrefix(
                Image(microsoftLogo, "Microsoft Logo")
                    .addClass("prefix-logo")
            )
        )
    ).setGap("20px").setMargin("20px")
)

Body(localStorage[ "microsoftAccount" ] ? sheets : sheets.add(login))

const hash = new URLSearchParams(location.hash.substring(1));
const token = hash.get("id_token")
if (token) {
    const information = token.split(".")[ 1 ]
    const user = await JSON.parse(new TextDecoder().decode(decodeBase64(information)))
    state.name = user.name
    sheets.remove(login)
}