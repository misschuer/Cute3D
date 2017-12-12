abstract class VectorBase<T> {
	protected constructor(){}
	abstract normalize(): void;
    abstract length(): number;
    abstract scaleBy(value: number): void;
	abstract distance(v:T):number;
}