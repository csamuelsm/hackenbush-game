"use client"

import { Button, Clipboard, Textarea } from "@chakra-ui/react";
import { useEffect, useState } from "react";


const SocialClipboard = (props : {
    lang: "English" | "Português" | "Français"
    won: boolean,
    color: "red" | "blue"
    version: "normal" | "misere"
}) => {

    const [text, setText] = useState<string>("");

    useEffect(() => {
        // Update text when lang changes
        setText(clipboardText());
    }, [props.lang, props.version])

    const clipboardText = () => {

        if (props.lang == "Português") {
            if (props.won) {
                return `🎉🥳 Eu venci o jogo do dia no Hackenbush ${props.version === 'normal' ? 'Normal' : 'Misère'} jogando como ${props.color === "red" ? "🔴 Vermelho" : "🔵 Azul"}!\n\nJogue Hackenbush em: https://hackenbush.vercel.app/`;
            } else {
                return `😔 Eu perdi o jogo do dia no Hackenbush ${props.version === 'normal' ? 'Normal' : 'Misère'} jogando como ${props.color === "red" ? "🔴 Vermelho" : "🔵 Azul"}, mas eu me diverti muito! 🤗\n\nJogue Hackenbush em: https://hackenbush.vercel.app/`
            }
        }
        else if (props.lang == "Français") {
            if (props.won) {
                return `🎉🥳 J'ai remporté le match du jour à Hackenbush ${props.version === 'normal' ? 'Normal' : 'Misère'} en jouant comme ${props.color === "red" ? "🔴 Rouge" : "🔵 Bleu"}!\n\nJouez à Hackenbush sur: https://hackenbush.vercel.app/`;
            } else {
                return `😔 J'ai raté le match du jour à Hackenbush ${props.version === 'normal' ? 'Normal' : 'Misère'} en jouant comme ${props.color === "red" ? "🔴 Rouge" : "🔵 Bleu"}, mais je me suis beaucoup amusé! 🤗\n\nJouez à Hackenbush sur: https://hackenbush.vercel.app/`
            }
        }
        else {
            if (props.won) {
                return `🎉🥳 I won today's Hackenbush ${props.version === 'normal' ? 'Normal' : 'Misère'} game playing as ${props.color === "red" ? "🔴 Red" : "🔵 Blue"}!\n\nPlay Hackenbush at: https://hackenbush.vercel.app/`;
            } else {
                return `😔 I lost today's Hackenbush ${props.version === 'normal' ? 'Normal' : 'Misère'} game playing as ${props.color === "red" ? "🔴 Red" : "🔵 Blue"}, but I had so much fun! 🤗\n\nPlay Hackenbush at: https://hackenbush.vercel.app/`
            }
        }
    }

    const label = () => {
        if (props.lang == "Português") {
            return "Compartilhe com seus amigos!";
        } else if (props.lang == "Français") {
            return "Partagez avec vos amis!";
        } else {
            return "Share with your friends!";
        }
    }

    return (
        <Clipboard.Root value={text} textAlign="center" paddingY={3}>
            <Clipboard.Label textStyle="label">
                {label()}
            </Clipboard.Label>
            <Textarea variant="subtle" defaultValue={text} />
            <Clipboard.Trigger asChild>
                <Button variant="surface" size="sm">
                <Clipboard.Indicator />
                <Clipboard.CopyText />
                </Button>
            </Clipboard.Trigger>
        </Clipboard.Root>
    )
}

export default SocialClipboard;
