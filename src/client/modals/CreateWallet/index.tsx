import { create } from "zustand";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { NumberInput } from "@heroui/number-input";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { useEffect, useState } from "react";
import { useZero } from "@/client/useZero";
import { v4 as uuid } from 'uuid';

const store = create<boolean>(() => false);
const useStore = store;

export const openCreateWalletModal = () => store.setState(true);

export default function CreateWalletModal() {
    const [name, setName] = useState<string>("");
    const [initialBudget, setInitialBudget] = useState<number>(0);
    const z = useZero();
    const isOpen = useStore();

    const canSubmit = name !== "";

    const submit = () => {
        z.mutate.wallets.insert({
            id: uuid(),
            initialBudget,
            name,
        });
        store.setState(false);
    };

    const reset = () => {
        setName("");
        setInitialBudget(0);
    };

    useEffect(() => {
        reset();
    }, [isOpen])

    return (
        <Modal backdrop="blur" isOpen={isOpen} onOpenChange={store.setState}>
            <ModalContent className="p-2">
                <ModalHeader>Create wallet</ModalHeader>
                <ModalBody>
                    <Input label="Name" value={name} onChange={e => setName(e.target.value)} />
                    <NumberInput min={0} formatOptions={{ minimumFractionDigits: 2 }} label="Starting value" value={initialBudget} onChange={e => setInitialBudget(e as number)} />
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" isDisabled={!canSubmit} onPress={submit}>Create</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}