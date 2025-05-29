import { Outlet, useLocation, useNavigate, useNavigation } from "react-router";
import { MdLogout, MdOutlineAccountBalanceWallet, MdOutlineCategory, MdOutlineSpaceDashboard, MdSettings, MdOutlineAdd } from "react-icons/md";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import Cookies from "js-cookie";
import type { IconType } from "react-icons/lib";
import CreateWalletModal, { openCreateWalletModal } from "../modals/CreateWallet";
import { useZero } from "../useZero";
import { useQuery } from "@rocicorp/zero/react";

function SidebarNav({ label, icon, path }: { label: string, icon: IconType, path: string }) {
    const navigate = useNavigate();
    const location = useLocation();

    const isHere = location.pathname.includes(path);

    return (
        <Button color="primary" onPress={() => navigate(path)} variant={isHere ? 'solid' : 'ghost'}>
            {icon({})}
            {label}
        </Button>
    );
}

function SidebarSection({ label, children, icon }: { label: string, children: React.ReactNode, icon: IconType }) {
    return (
        <>
            <section className="flex items-center gap-2">
                {icon({ className: "fill-neutral-500" })}
                <p className="text-neutral-500">{label}</p>
                <Divider className="w-auto flex-1" />
            </section>
            {children}
        </>
    )
}

function Wallets() {
    const navigate = useNavigate();
    const location = useLocation();

    const z = useZero();
    const query = z.query.wallets;
    const [wallets] = useQuery(query);

    const WalletButton = ({ id, name, total }: { id: string, name: string, total: number }) => {
        const isHere = location.pathname.startsWith(`/wallets/${id}`);

        return (<Button key={id} className="flex justify-between" variant={isHere ? 'ghost' : 'light'} onPress={() => navigate(`/wallets/${id}`)}>
            <p>{name}</p>
            <p>{total.toFixed(2)}</p>
        </Button>);
    }

    return (
        <SidebarSection icon={MdOutlineAccountBalanceWallet} label="Wallets">
            <WalletButton id="all" name="All wallets" total={1000} />
            {wallets.map(wallet => (<WalletButton id={wallet.id} name={wallet.name} total={0} />))}
            <Button variant="light" onPress={() => openCreateWalletModal()}>
                <MdOutlineAdd />
                New wallet
            </Button>
        </SidebarSection>
    );
}

export default function SystemLayout() {
    const navigate = useNavigate();

    const handleLogout = () => {
        Cookies.remove("jwt");
        navigate("/");
    };

    return (
        <>
            <CreateWalletModal />
            <section className="p-4 flex gap-2 h-screen w-screen">
                <div className="h-auto p-4 rounded-xl flex flex-col w-3xs shadow-small">
                    <section className="flex-1 flex flex-col gap-2">
                        <SidebarNav icon={MdOutlineSpaceDashboard} label="Dashboard" path="/dashboard" />
                        <SidebarNav icon={MdOutlineCategory} label="Categories" path="/categories" />
                        <Wallets />
                    </section>
                    <section className="flex flex-row-reverse gap-2">
                        <Button isIconOnly color="danger" variant="flat" onPress={handleLogout}>
                            <MdLogout />
                        </Button>
                        <Button isIconOnly color="primary" variant="flat" onPress={() => navigate("/settings")}>
                            <MdSettings />
                        </Button>
                    </section>
                </div>
                <div className="w-auto h-auto flex flex-col flex-1">
                    <Outlet />
                </div>
            </section>
        </>
    );
}