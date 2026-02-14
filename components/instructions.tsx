import { Badge, Button, CloseButton, Dialog, List, Portal } from "@chakra-ui/react"
import { Dispatch, SetStateAction, useState } from "react";

type props = {
    open: boolean,
    setOpen: Dispatch<SetStateAction<boolean>>
}

const Instructions = (props : props) => {

//const [open, setOpen] = useState<boolean>(true);

  return (
    <Dialog.Root 
        lazyMount 
        open={props.open} placement="center"
        onOpenChange={(e) => props.setOpen(e.open)}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Como jogar Hackenbush?</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <List.Root gap={2} variant="marker" align="center" paddingX={3}>
                <List.Item>
                    Cada jogador tem uma cor: 
                    <Badge colorPalette="red" marginX={1}><b>VERMELHO</b></Badge>ou
                    <Badge colorPalette="blue" marginX={1}><b>AZUL</b></Badge>.
                </List.Item>
                <List.Item>
                    <b>Clique em uma aresta da sua cor</b> para removê-la.
                </List.Item>
                <List.Item>
                    Alternadamente, os jogadores escolhem uma aresta da sua cor para <b>remover</b>.
                </List.Item>
                <List.Item>
                    Todas as arestas que ficarem <b>desconectadas da base</b> desaparecem.
                </List.Item>
                <List.Item>
                    O jogo acaba quando <b>não existir mais arestas</b> a serem escolhidas.
                </List.Item>
                <List.Item>
                    <b>O último jogador</b> a fazer um movimento <b>ganha o jogo.</b>
                </List.Item>
              </List.Root>
            </Dialog.Body>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}

export default Instructions;
