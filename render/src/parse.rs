use wasm_bindgen::{JsValue, prelude::wasm_bindgen};
use web_sys::js_sys::{Object, Reflect};

pub struct Tree {
  nodes: Vec<Node>,
}

type NodeIdx = usize;
type Result<T> = std::result::Result<T, String>;

struct Node {
  start: u16,
  end:   u16,
  kind:  NodeKind,
}

enum NodeKind {
  Bin { op: BinaryOp, left: NodeIdx, right: NodeIdx },
  Literal,
}

#[derive(Clone, Copy)]
enum BinaryOp {
  Add,
  Subtract,
  Multiply,
  Divide,
}

impl BinaryOp {
  fn binding_power(&self) -> u8 {
    match self {
      BinaryOp::Add | BinaryOp::Subtract => 1,
      BinaryOp::Multiply | BinaryOp::Divide => 2,
    }
  }

  fn as_char(&self) -> char {
    match self {
      BinaryOp::Add => '+',
      BinaryOp::Subtract => '-',
      BinaryOp::Multiply => '*',
      BinaryOp::Divide => '/',
    }
  }
}

#[cfg(target_arch = "wasm32")]
#[wasm_bindgen]
pub fn parse(text: &str) -> JsValue {
  let mut parser = Parser { text, pos: 0, out: Tree { nodes: vec![] } };
  match parser.expr() {
    Ok(_) => parser
      .out
      .nodes
      .iter()
      .map(|node| {
        let obj = Object::new();

        let _ = Reflect::set(&obj, &"start".into(), &JsValue::from(node.start));
        let _ = Reflect::set(&obj, &"end".into(), &JsValue::from(node.end));

        match node.kind {
          NodeKind::Bin { left, right, op } => {
            let _ = Reflect::set(&obj, &"type".into(), &"binary".into());
            let _ = Reflect::set(&obj, &"left".into(), &left.into());
            let _ = Reflect::set(&obj, &"right".into(), &right.into());
            let _ = Reflect::set(&obj, &"operator".into(), &op.as_char().to_string().into());
          }
          NodeKind::Literal => {
            let _ = Reflect::set(&obj, &"type".into(), &"literal".into());
            let _ = Reflect::set(
              &obj,
              &"value".into(),
              &text[node.start as usize..node.end as usize].into(),
            );
          }
        }

        obj
      })
      .collect::<Vec<_>>()
      .into(),

    Err(e) => e.into(),
  }
}

struct Parser<'a> {
  text: &'a str,
  pos:  u16,
  out:  Tree,
}

impl Parser<'_> {
  pub fn expr(&mut self) -> Result<NodeIdx> { self.expr_bp(0) }

  fn expr_bp(&mut self, bp: u8) -> Result<NodeIdx> {
    self.skip_whitespace();
    let start = self.pos;

    let mut lhs = self.atom()?;
    self.skip_whitespace();

    loop {
      let op = match self.head() {
        '+' => BinaryOp::Add,
        '-' => BinaryOp::Subtract,
        '*' => BinaryOp::Multiply,
        '/' => BinaryOp::Divide,
        _ => break Ok(lhs),
      };

      if op.binding_power() <= bp {
        break Ok(lhs);
      }

      self.bump(); // consume operator

      self.skip_whitespace();

      let rhs = self.expr_bp(op.binding_power())?;

      let idx = self.out.nodes.len();
      self.out.nodes.push(Node {
        start,
        end: self.pos,
        kind: NodeKind::Bin { op, left: lhs, right: rhs },
      });

      lhs = idx;
    }
  }

  fn atom(&mut self) -> Result<NodeIdx> {
    self.skip_whitespace();
    let start = self.pos;

    let kind = match self.head() {
      '0'..='9' | 'a'..='z' | 'A'..='Z' => {
        self.eat_literal();
        NodeKind::Literal
      }

      c => return Err(format!("unexpected character '{}'", c)),
    };

    let node = Node { start, end: self.pos, kind };
    let idx = self.out.nodes.len();
    self.out.nodes.push(node);

    Ok(idx)
  }

  fn head(&self) -> char { self.text[self.pos as usize..].chars().next().unwrap_or('\0') }
  fn bump(&mut self) -> char {
    let ch = self.head();
    self.pos += 1;
    ch
  }

  fn is_complete(&self) -> bool { self.pos as usize >= self.text.len() }

  fn eat_literal(&mut self) {
    while !self.is_complete() && self.head().is_ascii_alphanumeric() {
      self.bump();
    }
  }

  fn skip_whitespace(&mut self) {
    while !self.is_complete() && matches!(self.head(), ' ' | '\n' | '\t') {
      self.bump();
    }
  }
}

#[cfg(test)]
mod tests {
  use super::*;

  fn parse(text: &str) -> Tree {
    let mut parser = Parser { text, pos: 0, out: Tree { nodes: vec![] } };
    match parser.expr() {
      Ok(_) => parser.out,
      Err(e) => panic!("Failed to parse: {}", e),
    }
  }

  #[test]
  fn it_works() {
    assert_eq!(parse("1 + 2 * 3 - 4 / 5").nodes.len(), 9);
  }

  #[test]
  fn node_span_is_correct() {
    let src = "1 * 2 + 3";
    let t = parse(src);
    let slice = |idx: NodeIdx| &src[t.nodes[idx].start as usize..t.nodes[idx].end as usize];

    let root = t.nodes.len() - 1;

    assert_eq!(slice(root), "1 * 2 + 3");

    let NodeKind::Bin { left, right, .. } = t.nodes[root].kind else { panic!() };

    assert_eq!(slice(left), "1 * 2");
    assert_eq!(slice(right), "3");
  }
}
