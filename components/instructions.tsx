import { Badge, Button, CloseButton, Dialog, List, Portal } from "@chakra-ui/react"
import { Dispatch, SetStateAction, useState } from "react";

type props = {
    open: boolean,
    setOpen: Dispatch<SetStateAction<boolean>>,
    title: string,
    instructions_1: string,
    instructions_2: string,
    instructions_3: string,
    instructions_4: string,
    instructions_5: string,
    instructions_6: string,
    red: string,
    blue: string,
}

const Instructions = (props : props) => {

//const [open, setOpen] = useState<boolean>(true);

  return (
    <Dialog.Root 
        lazyMount 
        open={props.open} placement="center"
        onOpenChange={(e) => props.setOpen(e.open)}
        size="sm"
        motionPreset="slide-in-bottom"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>{props.title}</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <List.Root gap={2} variant="marker" align="center" paddingX={3}>
                <List.Item>
                    {props.instructions_1}
                    <Badge colorPalette="red" marginX={1}><b>{props.red}</b></Badge>, 
                    <Badge colorPalette="blue" marginX={1}><b>{props.blue}</b></Badge>.
                </List.Item>
                <List.Item>
                    {props.instructions_2}
                </List.Item>
                <List.Item>
                    {props.instructions_3}
                </List.Item>
                <List.Item>
                    {props.instructions_4}
                </List.Item>
                <List.Item>
                    {props.instructions_5}
                </List.Item>
                <List.Item>
                    {props.instructions_6}
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
