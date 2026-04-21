
import { ProcessMapData } from '../../types';

export function renderProcessMapToSvg(data: ProcessMapData): string {
    const PADDING = 20;
    const QUEUE_WIDTH = 200;
    const QUEUE_GAP = 20;
    const HEADER_HEIGHT = 40;
    const STATUS_WIDTH = 180;
    const STATUS_HEIGHT = 60;
    const STATUS_V_GAP = 40;
    
    const STATUS_STYLES = {
        User: { fill: '#e0efff', stroke: '#005a9e' },
        System: { fill: '#e8e8e8', stroke: '#555555' },
    };
    
    const totalQueues = data.queues.length;
    const svgWidth = (QUEUE_WIDTH * totalQueues) + (QUEUE_GAP * (totalQueues - 1)) + (PADDING * 2);
    
    const statusesByQueue = new Map<string, any[]>();
    data.statuses.forEach(status => {
        if (!statusesByQueue.has(status.queue)) {
            statusesByQueue.set(status.queue, []);
        }
        statusesByQueue.get(status.queue)!.push(status);
    });

    let maxStatusesInQueue = 0;
    for (const statuses of statusesByQueue.values()) {
        if (statuses.length > maxStatusesInQueue) {
            maxStatusesInQueue = statuses.length;
        }
    }

    const svgHeight = (HEADER_HEIGHT) + (STATUS_HEIGHT * maxStatusesInQueue) + (STATUS_V_GAP * (maxStatusesInQueue)) + (PADDING * 2);

    const statusCoordinates = new Map<string, {x: number, y: number, cx: number, cy: number}>();
    let svgElements: string[] = [];

    // Defs for markers
    svgElements.push(`
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#555" />
        </marker>
      </defs>
    `);
    
    // Background
    svgElements.push(`<rect width="${svgWidth}" height="${svgHeight}" fill="#f9f9f9" />`);

    // Draw Queues and Statuses
    data.queues.forEach((queue, i) => {
        const queueX = PADDING + i * (QUEUE_WIDTH + QUEUE_GAP);
        
        // Queue Header
        svgElements.push(`<text x="${queueX + QUEUE_WIDTH / 2}" y="${PADDING + 20}" font-family="sans-serif" font-size="16" font-weight="bold" text-anchor="middle" fill="#333">${queue.name}</text>`);
        svgElements.push(`<line x1="${queueX}" y1="${HEADER_HEIGHT}" x2="${queueX + QUEUE_WIDTH}" y2="${HEADER_HEIGHT}" stroke="#ccc" />`);
        
        const statuses = statusesByQueue.get(queue.id) || [];
        statuses.forEach((status, j) => {
            const statusX = queueX + (QUEUE_WIDTH - STATUS_WIDTH) / 2;
            const statusY = HEADER_HEIGHT + STATUS_V_GAP + j * (STATUS_HEIGHT + STATUS_V_GAP);
            
            statusCoordinates.set(status.id, {
                x: statusX,
                y: statusY,
                cx: statusX + STATUS_WIDTH / 2,
                cy: statusY + STATUS_HEIGHT / 2
            });

            const style = STATUS_STYLES[status.type];
            svgElements.push(`<rect x="${statusX}" y="${statusY}" width="${STATUS_WIDTH}" height="${STATUS_HEIGHT}" rx="5" fill="${style.fill}" stroke="${style.stroke}" />`);
            
            // Wrap text
            const words = status.label.split(' ');
            let line = '';
            let tspanElements = '';
            let lineNumber = 0;
            const lineHeight = 16;
            const y_start = statusY + STATUS_HEIGHT / 2 - (words.length > 4 ? lineHeight/2 : 0);

            words.forEach(word => {
                const testLine = line + word + ' ';
                // This is a simplification; a real implementation would use getComputedTextLength
                if (testLine.length > 20 && lineNumber < 2) { 
                    tspanElements += `<tspan x="${statusX + STATUS_WIDTH / 2}" dy="${lineNumber === 0 ? 0 : lineHeight}px">${line}</tspan>`;
                    line = word + ' ';
                    lineNumber++;
                } else {
                    line = testLine;
                }
            });
            tspanElements += `<tspan x="${statusX + STATUS_WIDTH / 2}" dy="${lineNumber === 0 ? 0 : lineHeight}px">${line}</tspan>`;
            
            svgElements.push(`<text y="${y_start}" font-family="sans-serif" font-size="14" text-anchor="middle" fill="#333">${tspanElements}</text>`);
        });
    });

    // Draw Progressions
    data.progressions.forEach(prog => {
        const from = statusCoordinates.get(prog.from);
        const to = statusCoordinates.get(prog.to);

        if (from && to) {
             svgElements.push(`<line x1="${from.cx}" y1="${from.cy}" x2="${to.cx}" y2="${to.cy}" stroke="#555" stroke-width="2" marker-end="url(#arrowhead)" />`);
             if (prog.label) {
                const labelX = (from.cx + to.cx) / 2;
                const labelY = (from.cy + to.cy) / 2 - 5;
                svgElements.push(`<rect x="${labelX - 35}" y="${labelY - 15}" width="70" height="20" fill="#f9f9f9" />`);
                svgElements.push(`<text x="${labelX}" y="${labelY}" font-family="sans-serif" font-size="12" text-anchor="middle" fill="#333">${prog.label}</text>`);
             }
        }
    });

    return `<svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">${svgElements.join('')}</svg>`;
}