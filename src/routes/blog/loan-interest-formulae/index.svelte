<!-- Equations converted to SVG using https://viereck.ch/latex-to-svg/ -->

<script>
	import * as d3 from 'd3-format';

	const formatCurrency = d3.format(',.0f');
	const formatZeroDP = d3.format('.0f');
	const formatOneDP = d3.format('.1f');

	let loan = 300_000;
	let interestRate = 4.2;
	let amortisationRate = 1.5;
	let numberMonths = 5;

	let lastMonth = null;
	let monthlyPayment = null;
	let outstandingLoan = null;
	let cumulativeInterest = null;

	$: {
		const r = interestRate / 1200;
		const a = amortisationRate / 1200;
		lastMonth = Math.log(1 + r / a) / Math.log(1 + r);
		const n = Math.min(numberMonths, lastMonth);
		monthlyPayment = loan * (r + a);
		outstandingLoan = loan - (loan * a / r) * ((1 + r) ** n - 1);
		cumulativeInterest = (loan * a / r) + loan * n * (r + a) - (loan * a * (1 + r) ** n) / r;
	}

</script>
<style>
	.svg {
		text-align: center;
		margin-bottom: 24px;  /* equal spacing between paragraphs */
	}
	input {
		width: 100px;
		text-align: right;
	}
	tr > td:nth-child(2) {
		/* column before input box containig e.g "l =" */
		text-align: right;
		white-space: nowrap;
		padding-right: 0;
	}
	tr > td:nth-child(3) {
		/* column with input box */
		text-align: right;
		padding-left: 5px;
		padding-right: 0;
	}
	tr > td:nth-child(4) {
		/* column after input containing e.g. "%" */
		padding-left: 5px;
	}

	/* hide up/down arrows on input boxes */
	input::-webkit-outer-spin-button,
	input::-webkit-inner-spin-button {
	   -webkit-appearance: none;
		margin: 0;
	}
	input[type=number] { -moz-appearance: textfield; }
</style>

<header>
	<hgroup>
		<h2>Formulae for the interest on a loan</h2>
		<h3>October 2023</h3>
	</hgroup>
	<p style="color: var(--muted-color)">
		Some simple and satisfying loan mathematics.
	</p>
</header>
<hr />
<p>
	I was recently doing some spreadsheets to work out the impact of taking on various
	loans. My speadsheets had the structure you would expect: one row per year and each
	row calculates its values from the previous one. But when it came to wanting to
	compare different loans, these big tables were cumbersome. So I went around looking
	for closed-form solutions for things like total iterest paid over <i>n</i> months.
	Sure, I could have searched for the solutions online, but it was a fun exercise to
	come up with the equations myself.
</p>
<p>
	The system works like this: you agree to loan for amount <i>l</i> for a monthly
	interest rate <i>r</i> and a monthly amortisation rate <i>a</i>. In Germany, an
	interest rate ("Sollzins") on a mortgage might be 4.2% and the amortisation
	("Tilgung") 1.5%, and you would <i>divide</i> by twelve to get the monthly rates
	they represent, giving you <i>r = 0.35%</i> and <i>a = 0.125%</i>.
</p>
<p>
	Your payment in the first month&#8212;let's call it <i>p</i>&#8212;consists of the
	two rates together applied to the loan:
</p>
<!-- p = lr +  la -->
<div class="svg"><svg xmlns="http://www.w3.org/2000/svg" width="83.888px" height="16.072px" viewBox="0 -694 4635 888" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true"><defs><path id="MJX-112-TEX-I-1D45D" d="M23 287Q24 290 25 295T30 317T40 348T55 381T75 411T101 433T134 442Q209 442 230 378L240 387Q302 442 358 442Q423 442 460 395T497 281Q497 173 421 82T249 -10Q227 -10 210 -4Q199 1 187 11T168 28L161 36Q160 35 139 -51T118 -138Q118 -144 126 -145T163 -148H188Q194 -155 194 -157T191 -175Q188 -187 185 -190T172 -194Q170 -194 161 -194T127 -193T65 -192Q-5 -192 -24 -194H-32Q-39 -187 -39 -183Q-37 -156 -26 -148H-6Q28 -147 33 -136Q36 -130 94 103T155 350Q156 355 156 364Q156 405 131 405Q109 405 94 377T71 316T59 280Q57 278 43 278H29Q23 284 23 287ZM178 102Q200 26 252 26Q282 26 310 49T356 107Q374 141 392 215T411 325V331Q411 405 350 405Q339 405 328 402T306 393T286 380T269 365T254 350T243 336T235 326L232 322Q232 321 229 308T218 264T204 212Q178 106 178 102Z"></path><path id="MJX-112-TEX-N-3D" d="M56 347Q56 360 70 367H707Q722 359 722 347Q722 336 708 328L390 327H72Q56 332 56 347ZM56 153Q56 168 72 173H708Q722 163 722 153Q722 140 707 133H70Q56 140 56 153Z"></path><path id="MJX-112-TEX-I-1D459" d="M117 59Q117 26 142 26Q179 26 205 131Q211 151 215 152Q217 153 225 153H229Q238 153 241 153T246 151T248 144Q247 138 245 128T234 90T214 43T183 6T137 -11Q101 -11 70 11T38 85Q38 97 39 102L104 360Q167 615 167 623Q167 626 166 628T162 632T157 634T149 635T141 636T132 637T122 637Q112 637 109 637T101 638T95 641T94 647Q94 649 96 661Q101 680 107 682T179 688Q194 689 213 690T243 693T254 694Q266 694 266 686Q266 675 193 386T118 83Q118 81 118 75T117 65V59Z"></path><path id="MJX-112-TEX-I-1D45F" d="M21 287Q22 290 23 295T28 317T38 348T53 381T73 411T99 433T132 442Q161 442 183 430T214 408T225 388Q227 382 228 382T236 389Q284 441 347 441H350Q398 441 422 400Q430 381 430 363Q430 333 417 315T391 292T366 288Q346 288 334 299T322 328Q322 376 378 392Q356 405 342 405Q286 405 239 331Q229 315 224 298T190 165Q156 25 151 16Q138 -11 108 -11Q95 -11 87 -5T76 7T74 17Q74 30 114 189T154 366Q154 405 128 405Q107 405 92 377T68 316T57 280Q55 278 41 278H27Q21 284 21 287Z"></path><path id="MJX-112-TEX-N-2B" d="M56 237T56 250T70 270H369V420L370 570Q380 583 389 583Q402 583 409 568V270H707Q722 262 722 250T707 230H409V-68Q401 -82 391 -82H389H387Q375 -82 369 -68V230H70Q56 237 56 250Z"></path><path id="MJX-112-TEX-I-1D44E" d="M33 157Q33 258 109 349T280 441Q331 441 370 392Q386 422 416 422Q429 422 439 414T449 394Q449 381 412 234T374 68Q374 43 381 35T402 26Q411 27 422 35Q443 55 463 131Q469 151 473 152Q475 153 483 153H487Q506 153 506 144Q506 138 501 117T481 63T449 13Q436 0 417 -8Q409 -10 393 -10Q359 -10 336 5T306 36L300 51Q299 52 296 50Q294 48 292 46Q233 -10 172 -10Q117 -10 75 30T33 157ZM351 328Q351 334 346 350T323 385T277 405Q242 405 210 374T160 293Q131 214 119 129Q119 126 119 118T118 106Q118 61 136 44T179 26Q217 26 254 59T298 110Q300 114 325 217T351 328Z"></path></defs><g stroke="currentColor" fill="currentColor" stroke-width="0" transform="scale(1,-1)"><g data-mml-node="math"><g data-mml-node="mi"><use data-c="1D45D" xlink:href="#MJX-112-TEX-I-1D45D"></use></g><g data-mml-node="mo" transform="translate(780.8,0)"><use data-c="3D" xlink:href="#MJX-112-TEX-N-3D"></use></g><g data-mml-node="mi" transform="translate(1836.6,0)"><use data-c="1D459" xlink:href="#MJX-112-TEX-I-1D459"></use></g><g data-mml-node="mi" transform="translate(2134.6,0)"><use data-c="1D45F" xlink:href="#MJX-112-TEX-I-1D45F"></use></g><g data-mml-node="mo" transform="translate(2807.8,0)"><use data-c="2B" xlink:href="#MJX-112-TEX-N-2B"></use></g><g data-mml-node="mi" transform="translate(3808,0)"><use data-c="1D459" xlink:href="#MJX-112-TEX-I-1D459"></use></g><g data-mml-node="mi" transform="translate(4106,0)"><use data-c="1D44E" xlink:href="#MJX-112-TEX-I-1D44E"></use></g></g></g></svg></div>
<p>
	The first term covers the interest payment and the second term reduces the loan
	which you now owe. Let's call the remaining loan after the first month
	<i>l<sub>1</sub></i>:
</p>
<!-- l_1 = l - la -->
<div class="svg"><svg xmlns="http://www.w3.org/2000/svg" width="79.920px" height="15.280px" viewBox="0 -694 4415.6 844" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true"><defs><path id="MJX-113-TEX-I-1D459" d="M117 59Q117 26 142 26Q179 26 205 131Q211 151 215 152Q217 153 225 153H229Q238 153 241 153T246 151T248 144Q247 138 245 128T234 90T214 43T183 6T137 -11Q101 -11 70 11T38 85Q38 97 39 102L104 360Q167 615 167 623Q167 626 166 628T162 632T157 634T149 635T141 636T132 637T122 637Q112 637 109 637T101 638T95 641T94 647Q94 649 96 661Q101 680 107 682T179 688Q194 689 213 690T243 693T254 694Q266 694 266 686Q266 675 193 386T118 83Q118 81 118 75T117 65V59Z"></path><path id="MJX-113-TEX-N-31" d="M213 578L200 573Q186 568 160 563T102 556H83V602H102Q149 604 189 617T245 641T273 663Q275 666 285 666Q294 666 302 660V361L303 61Q310 54 315 52T339 48T401 46H427V0H416Q395 3 257 3Q121 3 100 0H88V46H114Q136 46 152 46T177 47T193 50T201 52T207 57T213 61V578Z"></path><path id="MJX-113-TEX-N-3D" d="M56 347Q56 360 70 367H707Q722 359 722 347Q722 336 708 328L390 327H72Q56 332 56 347ZM56 153Q56 168 72 173H708Q722 163 722 153Q722 140 707 133H70Q56 140 56 153Z"></path><path id="MJX-113-TEX-N-2212" d="M84 237T84 250T98 270H679Q694 262 694 250T679 230H98Q84 237 84 250Z"></path><path id="MJX-113-TEX-I-1D44E" d="M33 157Q33 258 109 349T280 441Q331 441 370 392Q386 422 416 422Q429 422 439 414T449 394Q449 381 412 234T374 68Q374 43 381 35T402 26Q411 27 422 35Q443 55 463 131Q469 151 473 152Q475 153 483 153H487Q506 153 506 144Q506 138 501 117T481 63T449 13Q436 0 417 -8Q409 -10 393 -10Q359 -10 336 5T306 36L300 51Q299 52 296 50Q294 48 292 46Q233 -10 172 -10Q117 -10 75 30T33 157ZM351 328Q351 334 346 350T323 385T277 405Q242 405 210 374T160 293Q131 214 119 129Q119 126 119 118T118 106Q118 61 136 44T179 26Q217 26 254 59T298 110Q300 114 325 217T351 328Z"></path></defs><g stroke="currentColor" fill="currentColor" stroke-width="0" transform="scale(1,-1)"><g data-mml-node="math"><g data-mml-node="msub"><g data-mml-node="mi"><use data-c="1D459" xlink:href="#MJX-113-TEX-I-1D459"></use></g><g data-mml-node="mn" transform="translate(331,-150) scale(0.707)"><use data-c="31" xlink:href="#MJX-113-TEX-N-31"></use></g></g><g data-mml-node="mo" transform="translate(1012.3,0)"><use data-c="3D" xlink:href="#MJX-113-TEX-N-3D"></use></g><g data-mml-node="mi" transform="translate(2068.1,0)"><use data-c="1D459" xlink:href="#MJX-113-TEX-I-1D459"></use></g><g data-mml-node="mo" transform="translate(2588.3,0)"><use data-c="2212" xlink:href="#MJX-113-TEX-N-2212"></use></g><g data-mml-node="mi" transform="translate(3588.6,0)"><use data-c="1D459" xlink:href="#MJX-113-TEX-I-1D459"></use></g><g data-mml-node="mi" transform="translate(3886.6,0)"><use data-c="1D44E" xlink:href="#MJX-113-TEX-I-1D44E"></use></g></g></g></svg></div>
<p>
	In all subsequent months you still pay <i>p</i> to the bank. The part which is
	interest is calculated by applying the interest rate to the oustanding loan at the
	start of the month, and whatever is left over reduces the loan which you owe. In
	other words, the remaining loan after <i>n</i> months is as follows:
</p>
<!-- l_n = l_{n-1} - \left( p - rl_{n-1} \right) -->
<div class="svg"><svg xmlns="http://www.w3.org/2000/svg" width="176.176px" height="18.096px" viewBox="0 -750 9733.6 1000" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true"><defs><path id="MJX-111-TEX-I-1D459" d="M117 59Q117 26 142 26Q179 26 205 131Q211 151 215 152Q217 153 225 153H229Q238 153 241 153T246 151T248 144Q247 138 245 128T234 90T214 43T183 6T137 -11Q101 -11 70 11T38 85Q38 97 39 102L104 360Q167 615 167 623Q167 626 166 628T162 632T157 634T149 635T141 636T132 637T122 637Q112 637 109 637T101 638T95 641T94 647Q94 649 96 661Q101 680 107 682T179 688Q194 689 213 690T243 693T254 694Q266 694 266 686Q266 675 193 386T118 83Q118 81 118 75T117 65V59Z"></path><path id="MJX-111-TEX-I-1D45B" d="M21 287Q22 293 24 303T36 341T56 388T89 425T135 442Q171 442 195 424T225 390T231 369Q231 367 232 367L243 378Q304 442 382 442Q436 442 469 415T503 336T465 179T427 52Q427 26 444 26Q450 26 453 27Q482 32 505 65T540 145Q542 153 560 153Q580 153 580 145Q580 144 576 130Q568 101 554 73T508 17T439 -10Q392 -10 371 17T350 73Q350 92 386 193T423 345Q423 404 379 404H374Q288 404 229 303L222 291L189 157Q156 26 151 16Q138 -11 108 -11Q95 -11 87 -5T76 7T74 17Q74 30 112 180T152 343Q153 348 153 366Q153 405 129 405Q91 405 66 305Q60 285 60 284Q58 278 41 278H27Q21 284 21 287Z"></path><path id="MJX-111-TEX-N-3D" d="M56 347Q56 360 70 367H707Q722 359 722 347Q722 336 708 328L390 327H72Q56 332 56 347ZM56 153Q56 168 72 173H708Q722 163 722 153Q722 140 707 133H70Q56 140 56 153Z"></path><path id="MJX-111-TEX-N-2212" d="M84 237T84 250T98 270H679Q694 262 694 250T679 230H98Q84 237 84 250Z"></path><path id="MJX-111-TEX-N-31" d="M213 578L200 573Q186 568 160 563T102 556H83V602H102Q149 604 189 617T245 641T273 663Q275 666 285 666Q294 666 302 660V361L303 61Q310 54 315 52T339 48T401 46H427V0H416Q395 3 257 3Q121 3 100 0H88V46H114Q136 46 152 46T177 47T193 50T201 52T207 57T213 61V578Z"></path><path id="MJX-111-TEX-N-28" d="M94 250Q94 319 104 381T127 488T164 576T202 643T244 695T277 729T302 750H315H319Q333 750 333 741Q333 738 316 720T275 667T226 581T184 443T167 250T184 58T225 -81T274 -167T316 -220T333 -241Q333 -250 318 -250H315H302L274 -226Q180 -141 137 -14T94 250Z"></path><path id="MJX-111-TEX-I-1D45D" d="M23 287Q24 290 25 295T30 317T40 348T55 381T75 411T101 433T134 442Q209 442 230 378L240 387Q302 442 358 442Q423 442 460 395T497 281Q497 173 421 82T249 -10Q227 -10 210 -4Q199 1 187 11T168 28L161 36Q160 35 139 -51T118 -138Q118 -144 126 -145T163 -148H188Q194 -155 194 -157T191 -175Q188 -187 185 -190T172 -194Q170 -194 161 -194T127 -193T65 -192Q-5 -192 -24 -194H-32Q-39 -187 -39 -183Q-37 -156 -26 -148H-6Q28 -147 33 -136Q36 -130 94 103T155 350Q156 355 156 364Q156 405 131 405Q109 405 94 377T71 316T59 280Q57 278 43 278H29Q23 284 23 287ZM178 102Q200 26 252 26Q282 26 310 49T356 107Q374 141 392 215T411 325V331Q411 405 350 405Q339 405 328 402T306 393T286 380T269 365T254 350T243 336T235 326L232 322Q232 321 229 308T218 264T204 212Q178 106 178 102Z"></path><path id="MJX-111-TEX-I-1D45F" d="M21 287Q22 290 23 295T28 317T38 348T53 381T73 411T99 433T132 442Q161 442 183 430T214 408T225 388Q227 382 228 382T236 389Q284 441 347 441H350Q398 441 422 400Q430 381 430 363Q430 333 417 315T391 292T366 288Q346 288 334 299T322 328Q322 376 378 392Q356 405 342 405Q286 405 239 331Q229 315 224 298T190 165Q156 25 151 16Q138 -11 108 -11Q95 -11 87 -5T76 7T74 17Q74 30 114 189T154 366Q154 405 128 405Q107 405 92 377T68 316T57 280Q55 278 41 278H27Q21 284 21 287Z"></path><path id="MJX-111-TEX-N-29" d="M60 749L64 750Q69 750 74 750H86L114 726Q208 641 251 514T294 250Q294 182 284 119T261 12T224 -76T186 -143T145 -194T113 -227T90 -246Q87 -249 86 -250H74Q66 -250 63 -250T58 -247T55 -238Q56 -237 66 -225Q221 -64 221 250T66 725Q56 737 55 738Q55 746 60 749Z"></path></defs><g stroke="currentColor" fill="currentColor" stroke-width="0" transform="scale(1,-1)"><g data-mml-node="math"><g data-mml-node="msub"><g data-mml-node="mi"><use data-c="1D459" xlink:href="#MJX-111-TEX-I-1D459"></use></g><g data-mml-node="mi" transform="translate(331,-150) scale(0.707)"><use data-c="1D45B" xlink:href="#MJX-111-TEX-I-1D45B"></use></g></g><g data-mml-node="mo" transform="translate(1083,0)"><use data-c="3D" xlink:href="#MJX-111-TEX-N-3D"></use></g><g data-mml-node="msub" transform="translate(2138.8,0)"><g data-mml-node="mi"><use data-c="1D459" xlink:href="#MJX-111-TEX-I-1D459"></use></g><g data-mml-node="TeXAtom" transform="translate(331,-150) scale(0.707)" data-mjx-texclass="ORD"><g data-mml-node="mi"><use data-c="1D45B" xlink:href="#MJX-111-TEX-I-1D45B"></use></g><g data-mml-node="mo" transform="translate(600,0)"><use data-c="2212" xlink:href="#MJX-111-TEX-N-2212"></use></g><g data-mml-node="mn" transform="translate(1378,0)"><use data-c="31" xlink:href="#MJX-111-TEX-N-31"></use></g></g></g><g data-mml-node="mo" transform="translate(4070,0)"><use data-c="2212" xlink:href="#MJX-111-TEX-N-2212"></use></g><g data-mml-node="mrow" transform="translate(5070.2,0)"><g data-mml-node="mo"><use data-c="28" xlink:href="#MJX-111-TEX-N-28"></use></g><g data-mml-node="mi" transform="translate(389,0)"><use data-c="1D45D" xlink:href="#MJX-111-TEX-I-1D45D"></use></g><g data-mml-node="mo" transform="translate(1114.2,0)"><use data-c="2212" xlink:href="#MJX-111-TEX-N-2212"></use></g><g data-mml-node="mi" transform="translate(2114.4,0)"><use data-c="1D45F" xlink:href="#MJX-111-TEX-I-1D45F"></use></g><g data-mml-node="msub" transform="translate(2565.4,0)"><g data-mml-node="mi"><use data-c="1D459" xlink:href="#MJX-111-TEX-I-1D459"></use></g><g data-mml-node="TeXAtom" transform="translate(331,-150) scale(0.707)" data-mjx-texclass="ORD"><g data-mml-node="mi"><use data-c="1D45B" xlink:href="#MJX-111-TEX-I-1D45B"></use></g><g data-mml-node="mo" transform="translate(600,0)"><use data-c="2212" xlink:href="#MJX-111-TEX-N-2212"></use></g><g data-mml-node="mn" transform="translate(1378,0)"><use data-c="31" xlink:href="#MJX-111-TEX-N-31"></use></g></g></g><g data-mml-node="mo" transform="translate(4274.4,0)"><use data-c="29" xlink:href="#MJX-111-TEX-N-29"></use></g></g></g></g></svg></div>
<p>
	We can take this recursive equation along with the expression for
	<i>l<sub>1</sub></i> and plug it into Wolfram Mathematica to give us a closed-form
	expression for <b>the remaining loan after <i>n</i> months</b>:
</p>
<!-- l_n = l - \frac{la}{r}\Bigl((1 + r)^n - 1\Bigr) -->
<div class="svg"><svg xmlns="http://www.w3.org/2000/svg" width="204.552px" height="37.408px" viewBox="0 -1370 11301.4 2067" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true"><defs><path id="MJX-140-TEX-I-1D459" d="M117 59Q117 26 142 26Q179 26 205 131Q211 151 215 152Q217 153 225 153H229Q238 153 241 153T246 151T248 144Q247 138 245 128T234 90T214 43T183 6T137 -11Q101 -11 70 11T38 85Q38 97 39 102L104 360Q167 615 167 623Q167 626 166 628T162 632T157 634T149 635T141 636T132 637T122 637Q112 637 109 637T101 638T95 641T94 647Q94 649 96 661Q101 680 107 682T179 688Q194 689 213 690T243 693T254 694Q266 694 266 686Q266 675 193 386T118 83Q118 81 118 75T117 65V59Z"></path><path id="MJX-140-TEX-I-1D45B" d="M21 287Q22 293 24 303T36 341T56 388T89 425T135 442Q171 442 195 424T225 390T231 369Q231 367 232 367L243 378Q304 442 382 442Q436 442 469 415T503 336T465 179T427 52Q427 26 444 26Q450 26 453 27Q482 32 505 65T540 145Q542 153 560 153Q580 153 580 145Q580 144 576 130Q568 101 554 73T508 17T439 -10Q392 -10 371 17T350 73Q350 92 386 193T423 345Q423 404 379 404H374Q288 404 229 303L222 291L189 157Q156 26 151 16Q138 -11 108 -11Q95 -11 87 -5T76 7T74 17Q74 30 112 180T152 343Q153 348 153 366Q153 405 129 405Q91 405 66 305Q60 285 60 284Q58 278 41 278H27Q21 284 21 287Z"></path><path id="MJX-140-TEX-N-3D" d="M56 347Q56 360 70 367H707Q722 359 722 347Q722 336 708 328L390 327H72Q56 332 56 347ZM56 153Q56 168 72 173H708Q722 163 722 153Q722 140 707 133H70Q56 140 56 153Z"></path><path id="MJX-140-TEX-N-2212" d="M84 237T84 250T98 270H679Q694 262 694 250T679 230H98Q84 237 84 250Z"></path><path id="MJX-140-TEX-I-1D44E" d="M33 157Q33 258 109 349T280 441Q331 441 370 392Q386 422 416 422Q429 422 439 414T449 394Q449 381 412 234T374 68Q374 43 381 35T402 26Q411 27 422 35Q443 55 463 131Q469 151 473 152Q475 153 483 153H487Q506 153 506 144Q506 138 501 117T481 63T449 13Q436 0 417 -8Q409 -10 393 -10Q359 -10 336 5T306 36L300 51Q299 52 296 50Q294 48 292 46Q233 -10 172 -10Q117 -10 75 30T33 157ZM351 328Q351 334 346 350T323 385T277 405Q242 405 210 374T160 293Q131 214 119 129Q119 126 119 118T118 106Q118 61 136 44T179 26Q217 26 254 59T298 110Q300 114 325 217T351 328Z"></path><path id="MJX-140-TEX-I-1D45F" d="M21 287Q22 290 23 295T28 317T38 348T53 381T73 411T99 433T132 442Q161 442 183 430T214 408T225 388Q227 382 228 382T236 389Q284 441 347 441H350Q398 441 422 400Q430 381 430 363Q430 333 417 315T391 292T366 288Q346 288 334 299T322 328Q322 376 378 392Q356 405 342 405Q286 405 239 331Q229 315 224 298T190 165Q156 25 151 16Q138 -11 108 -11Q95 -11 87 -5T76 7T74 17Q74 30 114 189T154 366Q154 405 128 405Q107 405 92 377T68 316T57 280Q55 278 41 278H27Q21 284 21 287Z"></path><path id="MJX-140-TEX-LO-28" d="M180 96T180 250T205 541T266 770T353 944T444 1069T527 1150H555Q561 1144 561 1141Q561 1137 545 1120T504 1072T447 995T386 878T330 721T288 513T272 251Q272 133 280 56Q293 -87 326 -209T399 -405T475 -531T536 -609T561 -640Q561 -643 555 -649H527Q483 -612 443 -568T353 -443T266 -270T205 -41Z"></path><path id="MJX-140-TEX-N-28" d="M94 250Q94 319 104 381T127 488T164 576T202 643T244 695T277 729T302 750H315H319Q333 750 333 741Q333 738 316 720T275 667T226 581T184 443T167 250T184 58T225 -81T274 -167T316 -220T333 -241Q333 -250 318 -250H315H302L274 -226Q180 -141 137 -14T94 250Z"></path><path id="MJX-140-TEX-N-31" d="M213 578L200 573Q186 568 160 563T102 556H83V602H102Q149 604 189 617T245 641T273 663Q275 666 285 666Q294 666 302 660V361L303 61Q310 54 315 52T339 48T401 46H427V0H416Q395 3 257 3Q121 3 100 0H88V46H114Q136 46 152 46T177 47T193 50T201 52T207 57T213 61V578Z"></path><path id="MJX-140-TEX-N-2B" d="M56 237T56 250T70 270H369V420L370 570Q380 583 389 583Q402 583 409 568V270H707Q722 262 722 250T707 230H409V-68Q401 -82 391 -82H389H387Q375 -82 369 -68V230H70Q56 237 56 250Z"></path><path id="MJX-140-TEX-N-29" d="M60 749L64 750Q69 750 74 750H86L114 726Q208 641 251 514T294 250Q294 182 284 119T261 12T224 -76T186 -143T145 -194T113 -227T90 -246Q87 -249 86 -250H74Q66 -250 63 -250T58 -247T55 -238Q56 -237 66 -225Q221 -64 221 250T66 725Q56 737 55 738Q55 746 60 749Z"></path><path id="MJX-140-TEX-LO-29" d="M35 1138Q35 1150 51 1150H56H69Q113 1113 153 1069T243 944T330 771T391 541T416 250T391 -40T330 -270T243 -443T152 -568T69 -649H56Q43 -649 39 -647T35 -637Q65 -607 110 -548Q283 -316 316 56Q324 133 324 251Q324 368 316 445Q278 877 48 1123Q36 1137 35 1138Z"></path></defs><g stroke="currentColor" fill="currentColor" stroke-width="0" transform="scale(1,-1)"><g data-mml-node="math"><g data-mml-node="msub"><g data-mml-node="mi"><use data-c="1D459" xlink:href="#MJX-140-TEX-I-1D459"></use></g><g data-mml-node="mi" transform="translate(331,-150) scale(0.707)"><use data-c="1D45B" xlink:href="#MJX-140-TEX-I-1D45B"></use></g></g><g data-mml-node="mo" transform="translate(1083,0)"><use data-c="3D" xlink:href="#MJX-140-TEX-N-3D"></use></g><g data-mml-node="mi" transform="translate(2138.8,0)"><use data-c="1D459" xlink:href="#MJX-140-TEX-I-1D459"></use></g><g data-mml-node="mo" transform="translate(2659,0)"><use data-c="2212" xlink:href="#MJX-140-TEX-N-2212"></use></g><g data-mml-node="mfrac" transform="translate(3659.3,0)"><g data-mml-node="mrow" transform="translate(220,676)"><g data-mml-node="mi"><use data-c="1D459" xlink:href="#MJX-140-TEX-I-1D459"></use></g><g data-mml-node="mi" transform="translate(298,0)"><use data-c="1D44E" xlink:href="#MJX-140-TEX-I-1D44E"></use></g></g><g data-mml-node="mi" transform="translate(408,-686)"><use data-c="1D45F" xlink:href="#MJX-140-TEX-I-1D45F"></use></g><rect width="1027" height="60" x="120" y="220"></rect></g><g data-mml-node="TeXAtom" data-mjx-texclass="OPEN" transform="translate(4926.3,0)"><g data-mml-node="mo" transform="translate(0 -0.5)"><use data-c="28" xlink:href="#MJX-140-TEX-LO-28"></use></g></g><g data-mml-node="mo" transform="translate(5523.3,0)"><use data-c="28" xlink:href="#MJX-140-TEX-N-28"></use></g><g data-mml-node="mn" transform="translate(5912.3,0)"><use data-c="31" xlink:href="#MJX-140-TEX-N-31"></use></g><g data-mml-node="mo" transform="translate(6634.5,0)"><use data-c="2B" xlink:href="#MJX-140-TEX-N-2B"></use></g><g data-mml-node="mi" transform="translate(7634.7,0)"><use data-c="1D45F" xlink:href="#MJX-140-TEX-I-1D45F"></use></g><g data-mml-node="msup" transform="translate(8085.7,0)"><g data-mml-node="mo"><use data-c="29" xlink:href="#MJX-140-TEX-N-29"></use></g><g data-mml-node="mi" transform="translate(422,413) scale(0.707)"><use data-c="1D45B" xlink:href="#MJX-140-TEX-I-1D45B"></use></g></g><g data-mml-node="mo" transform="translate(9204.2,0)"><use data-c="2212" xlink:href="#MJX-140-TEX-N-2212"></use></g><g data-mml-node="mn" transform="translate(10204.4,0)"><use data-c="31" xlink:href="#MJX-140-TEX-N-31"></use></g><g data-mml-node="TeXAtom" data-mjx-texclass="CLOSE" transform="translate(10704.4,0)"><g data-mml-node="mo" transform="translate(0 -0.5)"><use data-c="29" xlink:href="#MJX-140-TEX-LO-29"></use></g></g></g></g></svg></div>

<p>
	Since the interest paid in any month is proportional to the loan outstanding from
	the month before, we can also easily use Wolfram Mathematica to calculate the
	<b>cumulative interest paid after <i>n</i> months</b>:
</p>
<!-- \frac{l a}{r} + l n (r + a) - \frac{l a (1 + r)^n}{r} -->
<div class="svg"><svg xmlns="http://www.w3.org/2000/svg" width="222.912px" height="39.040px" viewBox="0 -1460 12316 2157" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true"><defs><path id="MJX-6-TEX-I-1D459" d="M117 59Q117 26 142 26Q179 26 205 131Q211 151 215 152Q217 153 225 153H229Q238 153 241 153T246 151T248 144Q247 138 245 128T234 90T214 43T183 6T137 -11Q101 -11 70 11T38 85Q38 97 39 102L104 360Q167 615 167 623Q167 626 166 628T162 632T157 634T149 635T141 636T132 637T122 637Q112 637 109 637T101 638T95 641T94 647Q94 649 96 661Q101 680 107 682T179 688Q194 689 213 690T243 693T254 694Q266 694 266 686Q266 675 193 386T118 83Q118 81 118 75T117 65V59Z"></path><path id="MJX-6-TEX-I-1D44E" d="M33 157Q33 258 109 349T280 441Q331 441 370 392Q386 422 416 422Q429 422 439 414T449 394Q449 381 412 234T374 68Q374 43 381 35T402 26Q411 27 422 35Q443 55 463 131Q469 151 473 152Q475 153 483 153H487Q506 153 506 144Q506 138 501 117T481 63T449 13Q436 0 417 -8Q409 -10 393 -10Q359 -10 336 5T306 36L300 51Q299 52 296 50Q294 48 292 46Q233 -10 172 -10Q117 -10 75 30T33 157ZM351 328Q351 334 346 350T323 385T277 405Q242 405 210 374T160 293Q131 214 119 129Q119 126 119 118T118 106Q118 61 136 44T179 26Q217 26 254 59T298 110Q300 114 325 217T351 328Z"></path><path id="MJX-6-TEX-I-1D45F" d="M21 287Q22 290 23 295T28 317T38 348T53 381T73 411T99 433T132 442Q161 442 183 430T214 408T225 388Q227 382 228 382T236 389Q284 441 347 441H350Q398 441 422 400Q430 381 430 363Q430 333 417 315T391 292T366 288Q346 288 334 299T322 328Q322 376 378 392Q356 405 342 405Q286 405 239 331Q229 315 224 298T190 165Q156 25 151 16Q138 -11 108 -11Q95 -11 87 -5T76 7T74 17Q74 30 114 189T154 366Q154 405 128 405Q107 405 92 377T68 316T57 280Q55 278 41 278H27Q21 284 21 287Z"></path><path id="MJX-6-TEX-N-2B" d="M56 237T56 250T70 270H369V420L370 570Q380 583 389 583Q402 583 409 568V270H707Q722 262 722 250T707 230H409V-68Q401 -82 391 -82H389H387Q375 -82 369 -68V230H70Q56 237 56 250Z"></path><path id="MJX-6-TEX-I-1D45B" d="M21 287Q22 293 24 303T36 341T56 388T89 425T135 442Q171 442 195 424T225 390T231 369Q231 367 232 367L243 378Q304 442 382 442Q436 442 469 415T503 336T465 179T427 52Q427 26 444 26Q450 26 453 27Q482 32 505 65T540 145Q542 153 560 153Q580 153 580 145Q580 144 576 130Q568 101 554 73T508 17T439 -10Q392 -10 371 17T350 73Q350 92 386 193T423 345Q423 404 379 404H374Q288 404 229 303L222 291L189 157Q156 26 151 16Q138 -11 108 -11Q95 -11 87 -5T76 7T74 17Q74 30 112 180T152 343Q153 348 153 366Q153 405 129 405Q91 405 66 305Q60 285 60 284Q58 278 41 278H27Q21 284 21 287Z"></path><path id="MJX-6-TEX-N-28" d="M94 250Q94 319 104 381T127 488T164 576T202 643T244 695T277 729T302 750H315H319Q333 750 333 741Q333 738 316 720T275 667T226 581T184 443T167 250T184 58T225 -81T274 -167T316 -220T333 -241Q333 -250 318 -250H315H302L274 -226Q180 -141 137 -14T94 250Z"></path><path id="MJX-6-TEX-N-29" d="M60 749L64 750Q69 750 74 750H86L114 726Q208 641 251 514T294 250Q294 182 284 119T261 12T224 -76T186 -143T145 -194T113 -227T90 -246Q87 -249 86 -250H74Q66 -250 63 -250T58 -247T55 -238Q56 -237 66 -225Q221 -64 221 250T66 725Q56 737 55 738Q55 746 60 749Z"></path><path id="MJX-6-TEX-N-2212" d="M84 237T84 250T98 270H679Q694 262 694 250T679 230H98Q84 237 84 250Z"></path><path id="MJX-6-TEX-N-31" d="M213 578L200 573Q186 568 160 563T102 556H83V602H102Q149 604 189 617T245 641T273 663Q275 666 285 666Q294 666 302 660V361L303 61Q310 54 315 52T339 48T401 46H427V0H416Q395 3 257 3Q121 3 100 0H88V46H114Q136 46 152 46T177 47T193 50T201 52T207 57T213 61V578Z"></path></defs><g stroke="currentColor" fill="currentColor" stroke-width="0" transform="scale(1,-1)"><g data-mml-node="math"><g data-mml-node="mfrac"><g data-mml-node="mrow" transform="translate(220,676)"><g data-mml-node="mi"><use data-c="1D459" xlink:href="#MJX-6-TEX-I-1D459"></use></g><g data-mml-node="mi" transform="translate(298,0)"><use data-c="1D44E" xlink:href="#MJX-6-TEX-I-1D44E"></use></g></g><g data-mml-node="mi" transform="translate(408,-686)"><use data-c="1D45F" xlink:href="#MJX-6-TEX-I-1D45F"></use></g><rect width="1027" height="60" x="120" y="220"></rect></g><g data-mml-node="mo" transform="translate(1489.2,0)"><use data-c="2B" xlink:href="#MJX-6-TEX-N-2B"></use></g><g data-mml-node="mi" transform="translate(2489.4,0)"><use data-c="1D459" xlink:href="#MJX-6-TEX-I-1D459"></use></g><g data-mml-node="mi" transform="translate(2787.4,0)"><use data-c="1D45B" xlink:href="#MJX-6-TEX-I-1D45B"></use></g><g data-mml-node="mo" transform="translate(3387.4,0)"><use data-c="28" xlink:href="#MJX-6-TEX-N-28"></use></g><g data-mml-node="mi" transform="translate(3776.4,0)"><use data-c="1D45F" xlink:href="#MJX-6-TEX-I-1D45F"></use></g><g data-mml-node="mo" transform="translate(4449.7,0)"><use data-c="2B" xlink:href="#MJX-6-TEX-N-2B"></use></g><g data-mml-node="mi" transform="translate(5449.9,0)"><use data-c="1D44E" xlink:href="#MJX-6-TEX-I-1D44E"></use></g><g data-mml-node="mo" transform="translate(5978.9,0)"><use data-c="29" xlink:href="#MJX-6-TEX-N-29"></use></g><g data-mml-node="mo" transform="translate(6590.1,0)"><use data-c="2212" xlink:href="#MJX-6-TEX-N-2212"></use></g><g data-mml-node="mfrac" transform="translate(7590.3,0)"><g data-mml-node="mrow" transform="translate(220,710)"><g data-mml-node="mi"><use data-c="1D459" xlink:href="#MJX-6-TEX-I-1D459"></use></g><g data-mml-node="mi" transform="translate(298,0)"><use data-c="1D44E" xlink:href="#MJX-6-TEX-I-1D44E"></use></g><g data-mml-node="mo" transform="translate(827,0)"><use data-c="28" xlink:href="#MJX-6-TEX-N-28"></use></g><g data-mml-node="mn" transform="translate(1216,0)"><use data-c="31" xlink:href="#MJX-6-TEX-N-31"></use></g><g data-mml-node="mo" transform="translate(1938.2,0)"><use data-c="2B" xlink:href="#MJX-6-TEX-N-2B"></use></g><g data-mml-node="mi" transform="translate(2938.4,0)"><use data-c="1D45F" xlink:href="#MJX-6-TEX-I-1D45F"></use></g><g data-mml-node="msup" transform="translate(3389.4,0)"><g data-mml-node="mo"><use data-c="29" xlink:href="#MJX-6-TEX-N-29"></use></g><g data-mml-node="mi" transform="translate(422,363) scale(0.707)"><use data-c="1D45B" xlink:href="#MJX-6-TEX-I-1D45B"></use></g></g></g><g data-mml-node="mi" transform="translate(2137.4,-686)"><use data-c="1D45F" xlink:href="#MJX-6-TEX-I-1D45F"></use></g><rect width="4485.7" height="60" x="120" y="220"></rect></g></g></g></svg></div>

<p>
	We can also set <i>l<sub>n</sub> = 0</i> and solve for <i>n</i> to give us the
	<b>month in which the last payment is made</b>:
</p>
<!-- \frac{\log(1 + \frac{r}{a})}{\log(1 + r)} -->
<div class="svg"><svg xmlns="http://www.w3.org/2000/svg" width="91.088px" height="45.648px" viewBox="0 -1562.1 5032.5 2522.1" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true"><defs><path id="MJX-21-TEX-N-6C" d="M42 46H56Q95 46 103 60V68Q103 77 103 91T103 124T104 167T104 217T104 272T104 329Q104 366 104 407T104 482T104 542T103 586T103 603Q100 622 89 628T44 637H26V660Q26 683 28 683L38 684Q48 685 67 686T104 688Q121 689 141 690T171 693T182 694H185V379Q185 62 186 60Q190 52 198 49Q219 46 247 46H263V0H255L232 1Q209 2 183 2T145 3T107 3T57 1L34 0H26V46H42Z"></path><path id="MJX-21-TEX-N-6F" d="M28 214Q28 309 93 378T250 448Q340 448 405 380T471 215Q471 120 407 55T250 -10Q153 -10 91 57T28 214ZM250 30Q372 30 372 193V225V250Q372 272 371 288T364 326T348 362T317 390T268 410Q263 411 252 411Q222 411 195 399Q152 377 139 338T126 246V226Q126 130 145 91Q177 30 250 30Z"></path><path id="MJX-21-TEX-N-67" d="M329 409Q373 453 429 453Q459 453 472 434T485 396Q485 382 476 371T449 360Q416 360 412 390Q410 404 415 411Q415 412 416 414V415Q388 412 363 393Q355 388 355 386Q355 385 359 381T368 369T379 351T388 325T392 292Q392 230 343 187T222 143Q172 143 123 171Q112 153 112 133Q112 98 138 81Q147 75 155 75T227 73Q311 72 335 67Q396 58 431 26Q470 -13 470 -72Q470 -139 392 -175Q332 -206 250 -206Q167 -206 107 -175Q29 -140 29 -75Q29 -39 50 -15T92 18L103 24Q67 55 67 108Q67 155 96 193Q52 237 52 292Q52 355 102 398T223 442Q274 442 318 416L329 409ZM299 343Q294 371 273 387T221 404Q192 404 171 388T145 343Q142 326 142 292Q142 248 149 227T179 192Q196 182 222 182Q244 182 260 189T283 207T294 227T299 242Q302 258 302 292T299 343ZM403 -75Q403 -50 389 -34T348 -11T299 -2T245 0H218Q151 0 138 -6Q118 -15 107 -34T95 -74Q95 -84 101 -97T122 -127T170 -155T250 -167Q319 -167 361 -139T403 -75Z"></path><path id="MJX-21-TEX-N-2061" d=""></path><path id="MJX-21-TEX-N-28" d="M94 250Q94 319 104 381T127 488T164 576T202 643T244 695T277 729T302 750H315H319Q333 750 333 741Q333 738 316 720T275 667T226 581T184 443T167 250T184 58T225 -81T274 -167T316 -220T333 -241Q333 -250 318 -250H315H302L274 -226Q180 -141 137 -14T94 250Z"></path><path id="MJX-21-TEX-N-31" d="M213 578L200 573Q186 568 160 563T102 556H83V602H102Q149 604 189 617T245 641T273 663Q275 666 285 666Q294 666 302 660V361L303 61Q310 54 315 52T339 48T401 46H427V0H416Q395 3 257 3Q121 3 100 0H88V46H114Q136 46 152 46T177 47T193 50T201 52T207 57T213 61V578Z"></path><path id="MJX-21-TEX-N-2B" d="M56 237T56 250T70 270H369V420L370 570Q380 583 389 583Q402 583 409 568V270H707Q722 262 722 250T707 230H409V-68Q401 -82 391 -82H389H387Q375 -82 369 -68V230H70Q56 237 56 250Z"></path><path id="MJX-21-TEX-I-1D45F" d="M21 287Q22 290 23 295T28 317T38 348T53 381T73 411T99 433T132 442Q161 442 183 430T214 408T225 388Q227 382 228 382T236 389Q284 441 347 441H350Q398 441 422 400Q430 381 430 363Q430 333 417 315T391 292T366 288Q346 288 334 299T322 328Q322 376 378 392Q356 405 342 405Q286 405 239 331Q229 315 224 298T190 165Q156 25 151 16Q138 -11 108 -11Q95 -11 87 -5T76 7T74 17Q74 30 114 189T154 366Q154 405 128 405Q107 405 92 377T68 316T57 280Q55 278 41 278H27Q21 284 21 287Z"></path><path id="MJX-21-TEX-I-1D44E" d="M33 157Q33 258 109 349T280 441Q331 441 370 392Q386 422 416 422Q429 422 439 414T449 394Q449 381 412 234T374 68Q374 43 381 35T402 26Q411 27 422 35Q443 55 463 131Q469 151 473 152Q475 153 483 153H487Q506 153 506 144Q506 138 501 117T481 63T449 13Q436 0 417 -8Q409 -10 393 -10Q359 -10 336 5T306 36L300 51Q299 52 296 50Q294 48 292 46Q233 -10 172 -10Q117 -10 75 30T33 157ZM351 328Q351 334 346 350T323 385T277 405Q242 405 210 374T160 293Q131 214 119 129Q119 126 119 118T118 106Q118 61 136 44T179 26Q217 26 254 59T298 110Q300 114 325 217T351 328Z"></path><path id="MJX-21-TEX-N-29" d="M60 749L64 750Q69 750 74 750H86L114 726Q208 641 251 514T294 250Q294 182 284 119T261 12T224 -76T186 -143T145 -194T113 -227T90 -246Q87 -249 86 -250H74Q66 -250 63 -250T58 -247T55 -238Q56 -237 66 -225Q221 -64 221 250T66 725Q56 737 55 738Q55 746 60 749Z"></path></defs><g stroke="currentColor" fill="currentColor" stroke-width="0" transform="scale(1,-1)"><g data-mml-node="math"><g data-mml-node="mfrac"><g data-mml-node="mrow" transform="translate(220,812.1)"><g data-mml-node="mi"><use data-c="6C" xlink:href="#MJX-21-TEX-N-6C"></use><use data-c="6F" xlink:href="#MJX-21-TEX-N-6F" transform="translate(278,0)"></use><use data-c="67" xlink:href="#MJX-21-TEX-N-67" transform="translate(778,0)"></use></g><g data-mml-node="mo" transform="translate(1278,0)"><use data-c="2061" xlink:href="#MJX-21-TEX-N-2061"></use></g><g data-mml-node="mo" transform="translate(1278,0)"><use data-c="28" xlink:href="#MJX-21-TEX-N-28"></use></g><g data-mml-node="mn" transform="translate(1667,0)"><use data-c="31" xlink:href="#MJX-21-TEX-N-31"></use></g><g data-mml-node="mo" transform="translate(2389.2,0)"><use data-c="2B" xlink:href="#MJX-21-TEX-N-2B"></use></g><g data-mml-node="mfrac" transform="translate(3389.4,0)"><g data-mml-node="mi" transform="translate(247.6,394) scale(0.707)"><use data-c="1D45F" xlink:href="#MJX-21-TEX-I-1D45F"></use></g><g data-mml-node="mi" transform="translate(220,-345) scale(0.707)"><use data-c="1D44E" xlink:href="#MJX-21-TEX-I-1D44E"></use></g><rect width="574.1" height="60" x="120" y="220"></rect></g><g data-mml-node="mo" transform="translate(4203.5,0)"><use data-c="29" xlink:href="#MJX-21-TEX-N-29"></use></g></g><g data-mml-node="mrow" transform="translate(401.5,-710)"><g data-mml-node="mi"><use data-c="6C" xlink:href="#MJX-21-TEX-N-6C"></use><use data-c="6F" xlink:href="#MJX-21-TEX-N-6F" transform="translate(278,0)"></use><use data-c="67" xlink:href="#MJX-21-TEX-N-67" transform="translate(778,0)"></use></g><g data-mml-node="mo" transform="translate(1278,0)"><use data-c="2061" xlink:href="#MJX-21-TEX-N-2061"></use></g><g data-mml-node="mo" transform="translate(1278,0)"><use data-c="28" xlink:href="#MJX-21-TEX-N-28"></use></g><g data-mml-node="mn" transform="translate(1667,0)"><use data-c="31" xlink:href="#MJX-21-TEX-N-31"></use></g><g data-mml-node="mo" transform="translate(2389.2,0)"><use data-c="2B" xlink:href="#MJX-21-TEX-N-2B"></use></g><g data-mml-node="mi" transform="translate(3389.4,0)"><use data-c="1D45F" xlink:href="#MJX-21-TEX-I-1D45F"></use></g><g data-mml-node="mo" transform="translate(3840.4,0)"><use data-c="29" xlink:href="#MJX-21-TEX-N-29"></use></g></g><rect width="4792.5" height="60" x="120" y="220"></rect></g></g></g></svg></div>
<p>
	Here's an interactive calculator where you can try out the equations yourself with
	some example inputs:
</p>
<article>
	<table>
		<tr>
			<td>Loan principal</td>
			<td><i>l</i> = </td>
			<td><input type="number" bind:value={loan}></td>
			<td></td>
		</tr>
		<tr>
			<td>Interest rate</td>
			<td><i>12r</i> = </td>
			<td><input type="number" bind:value={interestRate}></td>
			<td>%</td>
		</tr>
		<tr>
			<td>Amortisation rate</td>
			<td><i>12a</i> = </td>
			<td><input type="number" bind:value={amortisationRate}></td>
			<td>%</td>
		</tr>
		<tr>
			<td>Months</td>
			<td><i>n</i> = </td>
			<td><input type="number" bind:value={numberMonths}></td>
			<td></td>
		</tr>
		<tr>
			<td>Monthly payment</td>
			<td><i>p</i> = </td>
			<td>{formatCurrency(monthlyPayment)}</td>
			<td></td>
		</tr>
		<tr>
			<td>Outstanding loan after {numberMonths} months</td>
			<td><i>l<sub>{numberMonths}</sub></i> = </td>
			<td>{formatCurrency(outstandingLoan)}</td>
			<td></td>
		</tr>
		<tr>
			<td>Cumulative interest paid after {numberMonths} months</td>
			<td></td>
			<td>{formatCurrency(cumulativeInterest)}</td>
			<td></td>
		</tr>
		<tr>
			<td>Month in which last payment will be made</td>
			<td></td>
			<td>{formatZeroDP(Math.ceil(lastMonth))}<br /><span style="font-size: small">(or {formatOneDP(lastMonth / 12)} years)</span></td>
			<td></td>
		</tr>
	</table>
</article>
