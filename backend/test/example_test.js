const { expect } = require('chai');

describe('ตัวอย่างการทดสอบ', () => {
  it('ควรบวกเลขได้ถูกต้อง', () => {
    const sum = 1 + 2;
    expect(sum).to.equal(3);
  });
});
