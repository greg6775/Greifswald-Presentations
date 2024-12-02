import { Image, Content, Grid, Label, Sheets, ref, asRefRecord, appendBody, WebGenTheme, DropDown, PrimaryButton, DialogContainer, Spinner } from "webgen/mod.ts";
// @deno-types="https://raw.githubusercontent.com/lucsoft-DevTeam/lucsoft.de/master/custom.d.ts"
import microsoftLogo from './microsoftLogo.svg';
import zod from "https://deno.land/x/zod@v3.23.8/index.ts";
import { decodeBase64 } from "@std/encoding";

const state = asRefRecord({
    name: undefined,
    presentations: <object[]>[],
    p1: undefined,
    p2: undefined,
    p3: undefined,
    p4: undefined
})

const sheets = Sheets()

async function loadData() {
    await fetch("/presentations")
        .then(x => x.json())
        .then(x => state.presentations.setValue(x))
}

const validation = zod.object({
    name: zod.string(),
    p1: zod.number({ required_error: "Vortrag 1 fehlt" }),
    p2: zod.number({ required_error: "Vortrag 2 fehlt" }),
    p3: zod.number({ required_error: "Vortrag 3 fehlt" }),
    p4: zod.number({ required_error: "Vortrag 4 fehlt" }),
})

const hash = new URLSearchParams(location.hash.substring(1));
const token = hash.get("id_token")
if (token) {
    const information = token.split(".")[ 1 ]
    const user = await JSON.parse(new TextDecoder().decode(decodeBase64(information)))
    localStorage[ "microsoft-account" ] = information
    state.name.setValue(user.name)
    await loadData()
    sheets.removeAll()
}

const loginSheet = Grid(
    Grid(
        Label("Bitte anmelden!")
            .setTextSize("3xl")
            .setFontWeight("bold"),
        PrimaryButton("Mit Microsoft anmelden")
            .addPrefix(
                Image(microsoftLogo, "Microsoft Logo")
                    .setWidth("20px"),
            )
            .onClick(() => location.href = "https://login.microsoftonline.com/8dc6c618-bb35-4c9a-9c53-f92dfdb2aa25/oauth2/v2.0/authorize?client_id=63d40ad5-5d88-40c1-b7b9-4f873cd7b601&response_type=id_token&redirect_uri=https%3A%2F%2Fgreifswald.greg.yachts&scope=openid%20profile&nonce=123")
    ).setGap("20px").setJustifyItems("center").setMargin("20px")
).setMinHeight("15rem")

appendBody(
    WebGenTheme(
        DialogContainer(sheets.visible(), sheets).setShouldCloseItself(() => false),
        Content(
            state.presentations.map(x => x.length == 0 ? Spinner() :
                Grid(
                    Label(ref`Name: ${state.name}`),
                    DropDown((state.presentations.value)[ "14.00" ].map(x => x.id), state.p1, "Vortrag 1 (14:00 - 14:20)").setValueRender(key => state.presentations.value[ "14.00" ].find(x => x.id == key)!.title),
                    DropDown((state.presentations.value)[ "14.30" ].map(x => x.id), state.p2, "Vortrag 2 (14:30 - 15:00)").setValueRender(key => state.presentations.value[ "14.30" ].find(x => x.id == key)!.title),
                    DropDown((state.presentations.value)[ "15.00" ].map(x => x.id), state.p3, "Vortrag 3 (15:10 - 15:20)").setValueRender(key => state.presentations.value[ "15.00" ].find(x => x.id == key)!.title),
                    DropDown((state.presentations.value)[ "15.30" ].map(x => x.id), state.p4, "Vortrag 4 (15:30 - 15:50)").setValueRender(key => state.presentations.value[ "15.30" ].find(x => x.id == key)!.title),
                ).setGap("20px").setMargin("20px 0px")
            ),
            PrimaryButton("Absenden").onPromiseClick(async () => {
                const data = await validation.safeParseAsync(Object.fromEntries(Object.entries(state).map(([ key, state ]) => [ key, state.value ])))
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
            }),
        )
            .setPadding("250px 20px 20px")
    )
)

checkLogin()

async function checkLogin() {
    if (localStorage[ "microsoft-account" ]) {
        const user = await JSON.parse(new TextDecoder().decode(decodeBase64(localStorage[ "microsoft-account" ])))
        state.name.setValue(user.name)
        await loadData()
    } else sheets.addSheet(loginSheet)
}