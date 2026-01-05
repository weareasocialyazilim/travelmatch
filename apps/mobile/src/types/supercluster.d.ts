/**
 * Type declarations for supercluster
 *
 * Supercluster is a library for clustering points on a map.
 * These declarations provide basic typing for our usage.
 */

declare module 'supercluster' {
  export interface ClusterProperties {
    cluster: boolean;
    cluster_id: number;
    point_count: number;
    point_count_abbreviated: string | number;
  }

  export interface PointFeature<P = Record<string, unknown>> {
    type: 'Feature';
    id?: string | number;
    properties: P;
    geometry: {
      type: 'Point';
      coordinates: [number, number];
    };
  }

  export interface ClusterFeature<P = Record<string, unknown>> {
    type: 'Feature';
    id?: number;
    properties: ClusterProperties & Partial<P>;
    geometry: {
      type: 'Point';
      coordinates: [number, number];
    };
  }

  export interface Options<P = Record<string, unknown>> {
    minZoom?: number;
    maxZoom?: number;
    minPoints?: number;
    radius?: number;
    extent?: number;
    nodeSize?: number;
    log?: boolean;
    generateId?: boolean;
    map?: (props: P) => Partial<P>;
    reduce?: (accumulated: Partial<P>, props: P) => void;
  }

  export default class Supercluster<
    P = Record<string, unknown>,
    C = Record<string, unknown>,
  > {
    constructor(options?: Options<P>);

    load(points: Array<PointFeature<P>>): Supercluster<P, C>;

    getClusters(
      bbox: [number, number, number, number],
      zoom: number,
    ): Array<ClusterFeature<P> | PointFeature<P>>;

    getTile(
      z: number,
      x: number,
      y: number,
    ): {
      features: Array<ClusterFeature<P> | PointFeature<P>>;
    } | null;

    getChildren(clusterId: number): Array<ClusterFeature<P> | PointFeature<P>>;

    getLeaves(
      clusterId: number,
      limit?: number,
      offset?: number,
    ): Array<PointFeature<P>>;

    getClusterExpansionZoom(clusterId: number): number;
  }
}
