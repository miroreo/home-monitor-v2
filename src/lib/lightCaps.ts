import type { HaEntity } from './types';

const COLOR_MODES = ['hs', 'rgb', 'xy', 'rgbw', 'rgbww'];

export interface LightCaps {
	brightness: boolean;
	color: boolean;
	colorTemp: boolean;
}

export function lightCapabilities(e: HaEntity): LightCaps {
	const modes = (e.attributes.supported_color_modes as string[] | undefined) ?? [];
	return {
		brightness: e.attributes.brightness !== undefined,
		color: modes.some((m) => COLOR_MODES.includes(m)),
		colorTemp: modes.includes('color_temp')
	};
}
