export interface ObjSaveAs {
    saveAsFunc: (data: Blob | string, filename: string, options: { autoBom: false }) => void;
}
