const countLetters = lettersArray => lettersArray.reduce((acc, elem) => {
  const val = acc[elem];
  return {
    ...acc,
    [elem]: val ? val + 1 : 1,
  };
}, {});

console.log(countLetters(['a', 'b', 'b', 'c']));
