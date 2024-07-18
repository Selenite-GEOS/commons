use std::collections::HashMap;

use wasm_bindgen::prelude::wasm_bindgen;

mod parser;

#[wasm_bindgen]
extern "C" {
    // Use `js_namespace` here to bind `console.log(..)` instead of just
    // `log(..)`
    #[wasm_bindgen(js_namespace = console)]
    fn error(s: &str);
}

#[wasm_bindgen(getter_with_clone)]
#[derive(Debug, Clone)]
pub struct SimpleType {
    pub name: String,
    pub doc: Option<String>,
    /** Pattern the type is bound to. */
    pub pattern: Option<String>,
    /** Options for enum types. */
    pub options: Option<Vec<String>>,
}

#[wasm_bindgen(getter_with_clone)]
#[derive(Debug, Clone)]
pub struct Field {
    pub name: String,
    pub default: Option<String>,
    pub type_name: String,
    pub doc: Option<String>,
    pub required: bool
}

#[wasm_bindgen(getter_with_clone)]
#[derive(Debug, Clone)]
pub struct ComplexType {
    pub name: String,
    pub doc: Option<String>,
    pub fields: Vec<Field>,
    pub children: Option<Vec<String>>,
}

#[wasm_bindgen(getter_with_clone)]
#[derive(Debug)]
pub struct XmlSchema {
    pub simple_types: Vec<SimpleType>,
    pub complex_types: Vec<ComplexType>,
}

impl XmlSchema {
    pub fn new() -> XmlSchema {
        XmlSchema {
            simple_types: Vec::new(),
            complex_types: Vec::new(),
        }
    }
}

// impl

#[wasm_bindgen]
pub fn parse_xsd(contents: &str) -> Option<XmlSchema> {
    let parsed_res = parser::parse(&contents);
    if let Err(msg) = parsed_res {
        error(msg);
        return None;
    }
    let parsed = parsed_res.unwrap();
    print!("{:#?}", parsed);
    // let mut children: HashMap<String, Vec<String>> = HashMap::new();
    let choice_suffix = "Choice";
    let type_suffix = "Type";
    let mut xml_schema = XmlSchema::new();
    let mut childless_complex_types: Vec<ComplexType> = Vec::new();
    for e in parsed.types {
        match e {
            // Childless complex type
            parser::types::RsEntity::Struct(complex) => {
                if complex.name.starts_with("AcousticSEM") {
                    dbg!(&complex.name);
                }
                childless_complex_types.push(ComplexType {
                    name: complex
                        .name
                        .to_string()
                        .trim_end_matches(type_suffix)
                        .to_string(),
                    doc: complex.comment,
                    children: None,
                    fields: complex
                        .fields
                        .borrow()
                        .iter().filter(|f| !f.name.ends_with(choice_suffix)).map(|f| Field {
                                name: f.name.clone(),
                                doc: f.comment.as_ref().and_then(|c| Some(c.trim_start_matches(&format!("{} => ", &f.name)).to_string())),
                                type_name: f.type_name.clone(),
                                required: f.type_modifiers.iter().all(|m| m != &parser::types::TypeModifier::Option),
                                default: f.default.clone()
                            }).collect::<Vec<Field>>()
                })
            }
            parser::types::RsEntity::StructField(_) => {}
            // Simple type
            parser::types::RsEntity::TupleStruct(simple) => {
                let mut pattern: Option<String> = None;
                let mut options: Option<Vec<String>> = None;
                for f in simple.facets {
                    match f.facet_type {
                        parser::xsd_elements::FacetType::Pattern(p) => {
                            let mut parts = p.split("|").collect::<Vec<&str>>();
                            if parts
                                .get(0)
                                .and_then(|s| Some(*s == r".*[\[\]`$].*"))
                                .unwrap_or(false)
                            {
                                // Remove first item of parts
                                parts.remove(0);
                            }
                            // Check that all parts are made of letters, numbers and underscores
                            if parts.iter().all(|s| {
                                s.chars()
                                    .all(|c| c.is_alphanumeric() || c == '_' || c == '-')
                            }) {
                                options = Some(parts.iter().map(|s| s.to_string()).collect());
                            }
                            pattern = Some(p);
                        }
                        _ => {}
                    }
                }
                xml_schema.simple_types.push(SimpleType {
                    name: simple.name,
                    doc: simple.comment,
                    pattern,
                    options,
                })
            }
            // Childfull complex type
            parser::types::RsEntity::Enum(en) => {
                if !en.name.ends_with(choice_suffix) {
                    continue;
                }
                if en.name.starts_with("AcousticSEM") {
                    dbg!(&en.name);
                }

                let name = en.name.trim_end_matches(choice_suffix);
                xml_schema.complex_types.push(ComplexType {
                    name: name.trim_end_matches(type_suffix).to_string(),
                    doc: en.comment,
                    children: Some(en.cases.iter().map(|c| c.name.clone()).collect()),
                    fields: en.subtypes.iter().flat_map(|subtype| match subtype {
                        parser::types::RsEntity::Struct(s) => {
                            s.fields.borrow().iter().filter(|f| !f.name.ends_with(choice_suffix)).map(|f| Field {
                                name: f.name.to_string(),
                                doc: f.comment.as_ref().and_then(|c| Some(c.trim_start_matches(&format!("{} => ", &f.name)).to_string())),
                                type_name: f.type_name.to_string(),
                                required: f.type_modifiers.iter().all(|m| m != &parser::types::TypeModifier::Option),
                                default: f.default.clone()
                            }).collect::<Vec<Field>>()
                        },
                        _ => {
                            vec![]
                        }
                    }).collect::<Vec<Field>>(),
                })
            }
            parser::types::RsEntity::EnumCase(_) => {}
            parser::types::RsEntity::Alias(_) => {}
            parser::types::RsEntity::Import(_) => {}
        }
    }
    xml_schema.complex_types.append(&mut childless_complex_types);
    // dbg!(children);
    Some(xml_schema)
}
