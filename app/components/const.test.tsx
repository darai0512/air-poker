import { expect, test } from "vitest";
import {PEER_ID_PATTERN} from "./const";

test.each`
  id | expected
  ${undefined} | ${false}
  ${'09269e8a-6afe-4e89-a987-91de03d48eab'} | ${true}
  ${'09269e8a-6afe-4e89_a987 91de03d48eaB'} | ${true}
  ${'09269e8a-6afe-4e89_a987 91de03d48ea'} | ${false}
  ${'09269e8a-6afe-4e89_a987 91de03d48eaBB'} | ${false}
`('id=$id match peer id: $expected', ({id, expected}) => {
  expect(new RegExp(PEER_ID_PATTERN).test(id)).toBe(expected)
});