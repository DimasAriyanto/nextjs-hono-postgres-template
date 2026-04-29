'use client';

import { useRef, useEffect, useState } from 'react';
import { Button } from './button';

interface SignaturePadProps {
    onChange?: (dataUrl: string | null) => void;
    initialValue?: string | null;
    height?: number;
    className?: string;
}

export function SignaturePad({ onChange, initialValue, height = 200, className = '' }: SignaturePadProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isDrawing = useRef(false);
    const lastPos = useRef<{ x: number; y: number } | null>(null);
    const [isEmpty, setIsEmpty] = useState(!initialValue);

    // Set canvas buffer size, then draw initial value if present
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const sync = () => {
            const rect = canvas.getBoundingClientRect();
            if (rect.width > 0) {
                canvas.width = Math.floor(rect.width);
                canvas.height = height;
                // Re-draw saved signature after resize
                if (initialValue) {
                    const img = new Image();
                    img.onload = () => {
                        canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height);
                    };
                    img.src = initialValue;
                }
            }
        };

        sync();
        const ro = new ResizeObserver(sync);
        ro.observe(canvas);
        return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [height, initialValue]);

    const getPoint = (
        e: MouseEvent | Touch,
        canvas: HTMLCanvasElement
    ): { x: number; y: number } => {
        const rect = canvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) * (canvas.width / rect.width),
            y: (e.clientY - rect.top) * (canvas.height / rect.height),
        };
    };

    const drawSegment = (from: { x: number; y: number }, to: { x: number; y: number }) => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
    };

    const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.setPointerCapture(e.pointerId);
        isDrawing.current = true;
        lastPos.current = getPoint(e.nativeEvent, canvas);
    };

    const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!isDrawing.current || !lastPos.current) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const current = getPoint(e.nativeEvent, canvas);
        drawSegment(lastPos.current, current);
        lastPos.current = current;
        setIsEmpty(false);
    };

    const onPointerUp = () => {
        isDrawing.current = false;
        lastPos.current = null;
        const canvas = canvasRef.current;
        if (canvas && !isEmpty) {
            onChange?.(canvas.toDataURL('image/png'));
        }
    };

    // also emit when user lifts on the very last stroke
    const onPointerUpWithSave = () => {
        isDrawing.current = false;
        lastPos.current = null;
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            // check if any non-white pixel exists
            const data = ctx?.getImageData(0, 0, canvas.width, canvas.height).data;
            const hasDrawing = data ? Array.from(data).some((v, i) => i % 4 !== 3 && v < 255) : false;
            if (hasDrawing) {
                setIsEmpty(false);
                onChange?.(canvas.toDataURL('image/png'));
            }
        }
    };

    const clear = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setIsEmpty(true);
        onChange?.(null);
    };

    return (
        <div className={`flex flex-col gap-2 ${className}`}>
            <canvas
                ref={canvasRef}
                style={{ height, touchAction: 'none', cursor: 'crosshair' }}
                className="w-full rounded-md border border-input bg-white"
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUpWithSave}
                onPointerLeave={onPointerUp}
            />
            <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                    {isEmpty ? 'Tanda tangani di area di atas' : 'Tanda tangan telah diisi'}
                </p>
                <Button type="button" variant="outline" size="sm" onClick={clear}>
                    Hapus
                </Button>
            </div>
        </div>
    );
}
