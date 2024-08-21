import { describe, expect, it } from 'vitest';
import { ComplexType, ChildProps, XmlSchema } from './xsd';

describe('XMLSchema', () => {
	describe('complexType', () => {
		describe('childProps', () => {
			it('should have the appropriate state', () => {
				const child = new ChildProps({
					type: 'Solvers',
					minOccurs: 1,
					maxOccurs: 1
				});
				expect(child.unique).toBe(true);
				expect(child.required).toBe(true);
			});
			describe('should be unique if max occurs <= 1', () => {
				it('max occurs = 1', () => {
					const child = new ChildProps({
						type: 'Solvers',
						maxOccurs: 1
					});
					expect(child.unique).toBe(true);
				});
				it('max occurs = 2', () => {
					const child = new ChildProps({
						type: 'Solvers',
						maxOccurs: 2
					});
					expect(child.unique).toBe(false);
				});
				it('max occurs = 0', () => {
					const child = new ChildProps({
						type: 'Solvers',
						maxOccurs: 0
					});
					expect(child.unique).toBe(true);
				});
				it('max occurs = undefined', () => {
					const child = new ChildProps({
						type: 'Solvers'
					});
					expect(child.unique).toBe(false);
				});
			});
			describe('should be required if min occurs >= 1', () => {
				it('min occurs = 1', () => {
					const child = new ChildProps({
						type: 'Solvers',
						minOccurs: 1
					});
					expect(child.required).toBe(true);
				});
				it('min occurs = 2', () => {
					const child = new ChildProps({
						type: 'Solvers',
						minOccurs: 2
					});
					expect(child.required).toBe(true);
				});
				it('min occurs = 0', () => {
					const child = new ChildProps({
						type: 'Solvers',
						minOccurs: 0
					});
					expect(child.required).toBe(false);
				});
				it('min occurs = undefined', () => {
					const child = new ChildProps({
						type: 'Solvers'
					});
					expect(child.required).toBe(false);
				});
			});
		});
		describe('optionalChildren', () => {
			it('should return optional children', () => {
				const complex = new ComplexType({
					name: 'Complex',
					children: [
						new ChildProps({ type: 'Events', minOccurs: 1, maxOccurs: 1 }),
						new ChildProps({ type: 'FieldSpecifications', maxOccurs: 1 }),
						new ChildProps({ type: 'Child3', minOccurs: 0 }), // optional
						new ChildProps({ type: 'Child4', minOccurs: 0, maxOccurs: 1 }), // optional
						new ChildProps({ type: 'Child5', minOccurs: 10 })
					]
				});
				expect(complex.optionalChildren).toEqual([
					new ChildProps({ type: 'FieldSpecifications', maxOccurs: 1 }),
					new ChildProps({ type: 'Child3', minOccurs: 0 }),
					new ChildProps({ type: 'Child4', minOccurs: 0, maxOccurs: 1 })
				]);
			});
		});
		describe('requiredChildren', () => {
			it('should return required children', () => {
				const complex = new ComplexType({
					name: 'Complex',
					children: [
						new ChildProps({ type: 'Child1', minOccurs: 1 }),
						new ChildProps({ type: 'Child2' }), // optional
						new ChildProps({ type: 'Child3', minOccurs: 0 }), // optional
						new ChildProps({ type: 'Child4', minOccurs: 0, maxOccurs: 1 }), // optional
						new ChildProps({ type: 'Child5', minOccurs: 10 })
					]
				});
				expect(complex.requiredChildren).toEqual([
					new ChildProps({ type: 'Child1', minOccurs: 1 }),
					new ChildProps({ type: 'Child5', minOccurs: 10 })
				]);
			});
		});
		describe('uniqueChildren', () => {
			it('should return unique children', () => {
				const complex = new ComplexType({
					name: 'Complex',
					children: [
						new ChildProps({ type: 'Child1', minOccurs: 1, maxOccurs: 1 }),
						new ChildProps({ type: 'Child2', maxOccurs: 1 }), // unique
						new ChildProps({ type: 'Child3', minOccurs: 0, maxOccurs: 1 }), // unique
						new ChildProps({ type: 'Child4', minOccurs: 0, maxOccurs: 2 }), // not unique
						new ChildProps({ type: 'Child5', minOccurs: 10 })
					]
				});
				expect(complex.uniqueChildren).toEqual([
					new ChildProps({ type: 'Child1', minOccurs: 1, maxOccurs: 1 }),
					new ChildProps({ type: 'Child2', maxOccurs: 1 }),
					new ChildProps({ type: 'Child3', minOccurs: 0, maxOccurs: 1 })
				]);
			});
		});
	});

	describe('saveable', () => {
		it('should be able to convert to and from object', () => {
			const schema = new XmlSchema();
			schema.addComplexType(
				new ComplexType({
					name: 'Test',
					attributes: [
						{
							name: 'a',
							default: null,
							type: 'string',
							required: true
						}
					],
					children: [
						new ChildProps({
							type: 'TestA'
						}),
						new ChildProps({
							type: 'TestB'
						})
					]
				})
			);
			schema.addSimpleType({
				name: 'string',
				doc: "oko"
			});
			
			expect(XmlSchema.fromJSON(schema.toJSON())).toEqual(schema)
		});
	});
});
