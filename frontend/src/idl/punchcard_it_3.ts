/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/punchcard_it_3.json`.
 */
export type PunchcardIt3 = {
  "address": "9FtgoQ4gZoCSj6zk2LyUDH1FCk3UBxLFhhJaiVJ6adpr",
  "metadata": {
    "name": "punchcardIt3",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "poc"
  },
  "instructions": [
    {
      "name": "clockIn",
      "discriminator": [
        206,
        150,
        221,
        145,
        122,
        124,
        77,
        89
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "dataAccount",
          "writable": true
        }
      ],
      "args": []
    },
    {
      "name": "clockIntermittentIn",
      "discriminator": [
        127,
        187,
        131,
        97,
        14,
        8,
        2,
        140
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "dataAccount",
          "writable": true
        }
      ],
      "args": []
    },
    {
      "name": "clockIntermittentOut",
      "discriminator": [
        34,
        208,
        165,
        230,
        13,
        11,
        112,
        16
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "dataAccount",
          "writable": true
        }
      ],
      "args": []
    },
    {
      "name": "clockLunchIn",
      "discriminator": [
        3,
        245,
        245,
        112,
        113,
        66,
        138,
        184
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "dataAccount",
          "writable": true
        }
      ],
      "args": []
    },
    {
      "name": "clockLunchOut",
      "discriminator": [
        92,
        113,
        181,
        55,
        228,
        96,
        122,
        182
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "dataAccount",
          "writable": true
        }
      ],
      "args": []
    },
    {
      "name": "clockOut",
      "discriminator": [
        45,
        156,
        240,
        66,
        181,
        57,
        211,
        196
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "dataAccount",
          "writable": true
        }
      ],
      "args": []
    },
    {
      "name": "initialize",
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "dataAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "arg",
                "path": "seed"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "seed",
          "type": "i128"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "employeeData",
      "discriminator": [
        166,
        195,
        110,
        33,
        71,
        96,
        75,
        28
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "alreadyClockedIn",
      "msg": "Already clocked in"
    },
    {
      "code": 6001,
      "name": "notClockedIn",
      "msg": "Not clocked in"
    }
  ],
  "types": [
    {
      "name": "employeeData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "active",
            "type": "bool"
          },
          {
            "name": "shiftStartClock",
            "type": "u64"
          },
          {
            "name": "shiftEndClock",
            "type": "u64"
          },
          {
            "name": "intermittentStartClock",
            "type": "u64"
          },
          {
            "name": "intermittentEndClock",
            "type": "u64"
          },
          {
            "name": "lunchStartClock",
            "type": "u64"
          },
          {
            "name": "lunchEndClock",
            "type": "u64"
          }
        ]
      }
    }
  ]
};
