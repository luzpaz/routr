/*
 * Copyright (C) 2023 by Fonoster Inc (https://fonoster.com)
 * http://github.com/fonoster/routr
 *
 * This file is part of Routr
 *
 * Licensed under the MIT License (the "License");
 * you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 *
 *    https://opensource.org/licenses/MIT
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package io.routr.headers;

import javax.sip.InvalidArgumentException;
import javax.sip.PeerUnavailableException;
import javax.sip.SipFactory;
import javax.sip.address.Address;
import javax.sip.address.AddressFactory;
import javax.sip.address.SipURI;
import java.text.ParseException;

public class AddressConverter {
  public io.routr.message.Address fromObject(Address address) {
    var builder = io.routr.message.Address.newBuilder();
    var sipUriConverter = new SipURIConverter();
    if (address.getDisplayName() != null) builder.setDisplayName(address.getDisplayName());
    builder.setWildcard(address.isWildcard());
    builder.setUri(sipUriConverter.fromObject((SipURI) address.getURI()));
    return builder.build();
  }

  public Address fromDTO(io.routr.message.Address dto) throws PeerUnavailableException, InvalidArgumentException, ParseException {
    var sipUriConverter = new SipURIConverter();
    AddressFactory factory = SipFactory.getInstance().createAddressFactory();
    Address address = factory.createAddress(sipUriConverter.fromDTO(dto.getUri()));
    if (!dto.getDisplayName().isEmpty()) address.setDisplayName(dto.getDisplayName());
    return address;
  }
}
