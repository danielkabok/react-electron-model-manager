import React, { lazy, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/offscreen';
import { ClipLoader, MoonLoader } from 'react-spinners';

import '../App.scss';

const Scene = lazy(() => import('./Scene'));

export default function ModelViewport(props: { dff: string, txd: string, game: string, categoryId: number }) {

	// Create a worker to render the scene
	const worker = new Worker(new URL('../utils/SceneWorker.tsx', import.meta.url), { type: 'module' });
	worker.postMessage({ type: 'MODEL_DATA', data: { dff: props.dff, txd: props.txd, game: props.game, categoryId: props.categoryId } });

	const loadingRef = useRef<HTMLDivElement>(null);
	const loadingDiv = useRef<HTMLDivElement>(null);
	const MemorizedCanvas = React.memo(Canvas, () => true);

	useEffect(() => {
		worker.onmessage = (event) => {
			if (event.data.type === 'MODEL_LOADED') {
				if (loadingRef.current) {
					loadingRef.current.style.display = 'none';
					loadingDiv.current?.classList.add("vanish");
				}
			}
		};

		return () => {
			// Terminate the worker when ModelViewport is unmounted
			worker.terminate();
		};
	}, [props]);

	// Prevent scrolling when zooming inside the scene
	const root = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const container = root.current;

		let active = false;
		let scrollPosition = 0;

		const handleMouseEnter = () => {
			active = true;
			scrollPosition = document.documentElement.scrollTop;
			window.addEventListener('wheel', preventDefaultScroll, { passive: false });
		};

		const handleMouseLeave = () => {
			active = false;
			window.removeEventListener('wheel', preventDefaultScroll);
		};

		const handleScroll = () => {
			if (active) {
				window.scrollTo(0, scrollPosition);
			}
		};

		const preventDefaultScroll = (e: WheelEvent) => {
			e.preventDefault();
		};

		if (container) {
			container.addEventListener('mouseenter', handleMouseEnter);
			container.addEventListener('mouseleave', handleMouseLeave);
			window.addEventListener('scroll', handleScroll);
		}

		return () => {
			if (container) {
				container.removeEventListener('mouseenter', handleMouseEnter);
				container.removeEventListener('mouseleave', handleMouseLeave);
			}
			
			window.removeEventListener('scroll', handleScroll);
			window.removeEventListener('wheel', preventDefaultScroll);
		};
	}, []);

	return (
		<div className='canvas-div' ref={root}>
			<MemorizedCanvas
				linear
				flat
				eventPrefix="client"
				worker={worker}
				fallback={<Scene dff={props.dff} txd={props.txd} game={props.game} categoryId={props.categoryId} handleFinished={() => { }} />}
			/>
			<div className='spinner-div' ref={loadingDiv}>
				<span ref={loadingRef}>
					<MoonLoader
						color="#FDC633"
						cssOverride={{}}
						loading
						size={64}
						speedMultiplier={0.5}
					/>
				</span>
			</div>
		</div>
	);
}
