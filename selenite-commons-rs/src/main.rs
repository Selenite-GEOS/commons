use std::{env, fs};

use selenite_commons_rs::parse_xsd;

fn main() {
    let args: Vec<String> = env::args().collect();
    let default_file = format!("../geos_schema.xsd");
    let filename = args.get(1).unwrap_or(&default_file);
    // .expect("Filename is required")
    
    let contents = fs::read_to_string(filename).unwrap();
    let parsed = parse_xsd(&contents).unwrap();
    
    print!("{:#?}", parsed);
}
