
export function formatError(err: Error): string {
    return err.name + ': ' + err.message;
}