import { type ReactNode } from "react";

type AlgorithmWrapperProps<T> = {
    useManagerHook: (args: {
        canvasSize: { width: number; height: number };
    }) => T;
    canvasSize: { width: number; height: number };
    render: (manager: T) => ReactNode;
};

export function AlgorithmWrapper<T>({
    useManagerHook,
    canvasSize,
    render,
}: AlgorithmWrapperProps<T>) {
    const manager = useManagerHook({ canvasSize });
    return render(manager);
}
