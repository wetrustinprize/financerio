import { create } from "zustand";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { useEffect, useState } from "react";
import { useZero } from "@/client/useZero";
import { v4 as uuid } from 'uuid';
import { TransactionTypeEnum, type TransactionType } from "@/generic/types/transactionType";
import { Autocomplete, AutocompleteItem } from "@heroui/autocomplete";

const store = create<boolean>(() => false);
const useStore = store;

export const openCreateCategoryModal = () => store.setState(true);

export default function CreateCategoryModal() {
    const [name, setName] = useState<string>("");
    const [type, setType] = useState<TransactionType | ''>('');
    const z = useZero();
    const isOpen = useStore();

    const canSubmit = name !== '' && type !== '';

    const submit = () => {
        z.mutate.categories.insert({
            id: uuid(),
            name,
            type: type as TransactionType,
            archived: false,
        });
        store.setState(false);
    };

    const reset = () => {
        setName("");
        setType("");
    };

    useEffect(() => {
        reset();
    }, [isOpen])

    return (
        <Modal isOpen={isOpen} onOpenChange={store.setState}>
            <ModalContent className="p-2">
                <ModalHeader>Create wallet</ModalHeader>
                <ModalBody>
                    <Input label="Name" value={name} onChange={e => setName(e.target.value)} />
                    <Autocomplete onSelectionChange={e => setType(e === null ? '' : e as TransactionType)} label="Type">
                        {Object.values(TransactionTypeEnum.Enum).map(type => (
                            <AutocompleteItem key={type}>{type}</AutocompleteItem>
                        ))}
                    </Autocomplete>
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" isDisabled={!canSubmit} onPress={submit}>Create</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}