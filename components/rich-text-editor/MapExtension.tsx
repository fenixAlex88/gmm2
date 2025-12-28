import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import MapComponent from './MapComponent';


export interface MapMarker {
	lat: number;
	lng: number;
	label?: string;
}

export const MapExtension = Node.create({
	name: 'mapBlock',
	group: 'block',
	atom: true,

	addAttributes() {
		return {
			markers: {
				default: [], 

				parseHTML: element => {
					try {
						return JSON.parse(element.getAttribute('markers') || '[]');
					} catch {
						return [];
					}
				},
				renderHTML: attributes => {
					return {
						markers: JSON.stringify(attributes.markers),
					};
				},
			},
		};
	},

	parseHTML() {
		return [{ tag: 'map-block' }];
	},

	renderHTML({ HTMLAttributes }) {
		return ['map-block', mergeAttributes(HTMLAttributes)];
	},

	addNodeView() {
		return ReactNodeViewRenderer(MapComponent);
	},
});