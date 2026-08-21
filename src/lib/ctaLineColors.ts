// Official CTA rail line colors: https://www.transitchicago.com/assets/1/6/cta_brand_guidelines.pdf
// `rt` codes as returned by the TrainTracker API.
const LINE_COLORS: Record<string, { bg: string; text: string }> = {
	Red: { bg: '#c60c30', text: '#ffffff' },
	Blue: { bg: '#00a1de', text: '#ffffff' },
	Brn: { bg: '#62361b', text: '#ffffff' },
	G: { bg: '#009b3a', text: '#ffffff' },
	Org: { bg: '#f9461c', text: '#ffffff' },
	P: { bg: '#522398', text: '#ffffff' },
	Pink: { bg: '#e27ea6', text: '#000000' },
	Y: { bg: '#f9e300', text: '#000000' }
};

const DEFAULT_COLOR = { bg: '#4b5563', text: '#ffffff' };

export function trainLineStyle(line: string, destination: string): { bg: string; text: string } {
	const base = LINE_COLORS[line] ?? DEFAULT_COLOR;
	// Green Line trains destined for the Cottage Grove branch display inverted,
	// matching CTA's own station signage convention for distinguishing the branch.
	if (line === 'G' && destination.toLowerCase().includes('cottage grove')) {
		return { bg: base.text, text: base.bg };
	}
	return base;
}
