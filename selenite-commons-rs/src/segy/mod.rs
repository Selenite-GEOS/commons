use giga_segy_in::SegyFile;
use std::env::var;
use std::path::PathBuf;
use wasm_bindgen::prelude::wasm_bindgen;

#[wasm_bindgen(getter_with_clone)]
#[derive(Debug, Clone)]
pub struct SEGYInfo {
    pub trace_count: usize,
}

#[wasm_bindgen]
pub fn read_segy_info() -> Result<SEGYInfo, String> {
    let mut root = var("CARGO_MANIFEST_DIR").map(PathBuf::from).unwrap();
    root.pop();
    let name = root.join("static").join("acquitoy_cube300x300x300.segy");
    dbg!(&name);
    let file = SegyFile::open(name.to_str().unwrap(), Default::default()).unwrap();

    let text_header: &str = file.get_text_header();
    // SEG-Y text headers should always have 3200 character.
    assert_eq!(text_header.len(), 3200);
    println!("Text header: {:?}", text_header);

    let bin_header = file.get_bin_header();
    println!("Bin header: {}", bin_header);

    // Get the data in the order of appearance of traces in the file.
    // Of course there are more organised ways of doing this, but for a demo, this will do.
    for trace in file.traces_iter() {
        println!("Trace header: {}", trace.get_header());
        let data: Vec<f32> = file.get_trace_data_as_f32_from_trace(trace).unwrap();
        println!("Data: {:?}", &data);
    }

    Ok(SEGYInfo {
        trace_count: file.trace_count(),
    })
}
