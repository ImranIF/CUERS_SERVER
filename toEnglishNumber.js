function toEnglishNumber(banglaInteger) {
  // if (
  //   new RegExp("^\\d+(\\.\\d+)?$").test(
  //     banglaInteger && banglaInteger.toString()
  //   )
  // ) {
  const englishInteger = banglaInteger
    .toString()
    .replace(/০/g, '0')
    .replace(/১/g, '1')
    .replace(/২/g, '2')
    .replace(/৩/g, '3')
    .replace(/৪/g, '4')
    .replace(/৫/g, '5')
    .replace(/৬/g, '6')
    .replace(/৭/g, '7')
    .replace(/৮/g, '8')
    .replace(/৯/g, '9');
  return englishInteger;
  // }
}

module.exports = toEnglishNumber;
